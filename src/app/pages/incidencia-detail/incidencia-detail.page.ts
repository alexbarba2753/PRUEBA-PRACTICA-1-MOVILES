import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  AlertController,
  LoadingController,
  ToastController,
  RefresherCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  calendarOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  bookmark,
  bookmarkOutline,
  cloudOutline,
  warningOutline,
  constructOutline,
  checkmarkDoneOutline,
  banOutline,
  refreshOutline
} from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-incidencia-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ],
  templateUrl: './incidencia-detail.page.html',
  styleUrls: ['./incidencia-detail.page.scss']
})
export class IncidenciaDetailPage implements OnInit {
  incidencia = signal<Incidencia | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  // Computado reactivo: detecta inmediatamente si la incidencia está en seguimiento local (R1)
  isMarked = computed(() => {
    const inc = this.incidencia();
    return this.storageService.isMarked(inc?.codigo, inc?.id);
  });

  constructor(
    private route: ActivatedRoute,
    private incidenciasService: IncidenciasService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      locationOutline,
      calendarOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
      bookmark,
      bookmarkOutline,
      cloudOutline,
      warningOutline,
      constructOutline,
      checkmarkDoneOutline,
      banOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncidencia(id);
    }
  }

  loadIncidencia(id: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.incidenciasService.getIncidenciaById(id).subscribe({
      next: item => {
        this.incidencia.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    const current = this.incidencia();
    if (!current) {
      customEvent.target.complete();
      return;
    }
    const id = current.id || current.codigo;
    this.incidenciasService.getIncidenciaById(id).subscribe({
      next: item => {
        this.incidencia.set(item);
        customEvent.target.complete();
      },
      error: () => customEvent.target.complete()
    });
  }

  // R1: Conmutar seguimiento local
  async toggleSeguimiento(): Promise<void> {
    const current = this.incidencia();
    if (!current) return;
    const code = current.codigo || current.id || '';
    const marked = await this.storageService.toggleMark(code);

    const toast = await this.toastCtrl.create({
      message: marked
        ? `Incidencia ${code} guardada en seguimiento local.`
        : `Incidencia ${code} eliminada de seguimiento local.`,
      duration: 2000,
      color: marked ? 'warning' : 'medium'
    });
    await toast.present();
  }

  // R9: Reglas de transición de estado
  async cambiarAEnProceso(): Promise<void> {
    const current = this.incidencia();
    if (!current) return;

    if (current.estado === 'resuelta') {
      await this.mostrarAlertaTransicionInvalida();
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Actualizando estado...' });
    await loader.present();

    const id = current.id || current.codigo;
    this.incidenciasService.updateIncidencia(id, { estado: 'en_proceso' }).subscribe({
      next: async updated => {
        await loader.dismiss();
        this.incidencia.set(updated);
        const toast = await this.toastCtrl.create({
          message: 'Estado actualizado a "En Proceso".',
          duration: 2500,
          color: 'primary'
        });
        await toast.present();
      },
      error: async () => {
        await loader.dismiss();
        this.mostrarAlertaError();
      }
    });
  }

  // Transición: pendiente / en_proceso -> resuelta (requiere observación obligatoria)
  async solicitarResolucion(): Promise<void> {
    const current = this.incidencia();
    if (!current) return;

    if (current.estado === 'resuelta') {
      const toast = await this.toastCtrl.create({
        message: 'Esta incidencia ya se encuentra resuelta.',
        duration: 2000
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Resolver Incidencia',
      subHeader: 'Observación de cierre obligatoria (R9)',
      message: 'Ingresa el detalle de las acciones de mantenimiento realizadas:',
      inputs: [
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: 'Ej: Cuadrilla técnica realizó reparación y asfaltado...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Marcar como Resuelta',
          handler: data => {
            const obs = data?.observacion?.trim();
            if (!obs) {
              this.mostrarToastErrorObservacion();
              return false; // Impide cerrar diálogo si falta observación
            }
            this.ejecutarResolucion(obs);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async ejecutarResolucion(observacion: string): Promise<void> {
    const current = this.incidencia();
    if (!current) return;

    const loader = await this.loadingCtrl.create({ message: 'Registrando resolución...' });
    await loader.present();

    const id = current.id || current.codigo;
    this.incidenciasService.updateIncidencia(id, {
      estado: 'resuelta',
      observacion
    }).subscribe({
      next: async updated => {
        await loader.dismiss();
        this.incidencia.set(updated);
        const toast = await this.toastCtrl.create({
          message: 'Incidencia marcada como RESUELTA exitosamente.',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async () => {
        await loader.dismiss();
        this.mostrarAlertaError();
      }
    });
  }

  // Regla R9: Demostración de intento de regresar una incidencia resuelta a pendiente
  async intentarRegresarAPendiente(): Promise<void> {
    await this.mostrarAlertaTransicionInvalida();
  }

  private async mostrarAlertaTransicionInvalida(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Transición No Permitida (R9)',
      message: 'Una incidencia en estado RESUELTA no puede regresar a estado "Pendiente" ni "En Proceso".',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  private async mostrarToastErrorObservacion(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'La observación es estrictamente obligatoria para resolver la incidencia.',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  private async mostrarAlertaError(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudo comunicar con el servicio de oficina.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  getEstadoColor(estado?: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  formatEstado(estado?: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'resuelta': return 'Resuelta';
      default: return estado || '';
    }
  }
}
