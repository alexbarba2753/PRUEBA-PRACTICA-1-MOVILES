import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  navigateOutline,
  documentTextOutline,
  constructOutline,
  checkmarkDoneOutline,
  banOutline,
  refreshOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia, EstadoIncidencia } from '../../core/models/incidencia.model';

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
export class IncidenciaDetailPage implements OnInit, OnDestroy {
  incidencia: Incidencia | null = null;
  isLoading = true;
  hasError = false;
  isMarked = false;

  private routeSub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private incidenciasService: IncidenciasService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
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
      navigateOutline,
      documentTextOutline,
      constructOutline,
      checkmarkDoneOutline,
      banOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    this.routeSub.add(
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadIncidencia(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  loadIncidencia(id: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.incidenciasService.getIncidenciaById(id).subscribe({
      next: async (item) => {
        this.incidencia = item;
        this.isLoading = false;
        const code = item.codigo || item.id || '';
        this.isMarked = await this.storageService.isMarked(code);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    if (!this.incidencia) {
      customEvent.target.complete();
      return;
    }
    const id = this.incidencia.id || this.incidencia.codigo;
    this.incidenciasService.getIncidenciaById(id).subscribe({
      next: async (item) => {
        this.incidencia = item;
        const code = item.codigo || item.id || '';
        this.isMarked = await this.storageService.isMarked(code);
        customEvent.target.complete();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        customEvent.target.complete();
        this.cdr.markForCheck();
      }
    });
  }

  async toggleSeguimiento(): Promise<void> {
    if (!this.incidencia) return;
    const code = this.incidencia.codigo || this.incidencia.id || '';
    this.isMarked = await this.storageService.toggleMark(code);

    const toast = await this.toastCtrl.create({
      message: this.isMarked
        ? `Incidencia ${code} guardada en seguimiento local.`
        : `Incidencia ${code} eliminada de seguimiento local.`,
      duration: 2000,
      color: this.isMarked ? 'warning' : 'medium'
    });
    await toast.present();
  }

  // ==========================================
  // R9: REGLAS DE TRANSICIÓN Y ACTUALIZACIÓN
  // ==========================================

  async cambiarAEnProceso(): Promise<void> {
    if (!this.incidencia) return;

    if (this.incidencia.estado === 'resuelta') {
      await this.mostrarAlertaTransicionInvalida();
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Actualizando estado en servicio...' });
    await loader.present();

    const id = this.incidencia.id || this.incidencia.codigo;
    this.incidenciasService.updateIncidencia(id, { estado: 'en_proceso' }).subscribe({
      next: async (updated) => {
        await loader.dismiss();
        this.incidencia = updated;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        const toast = await this.toastCtrl.create({
          message: 'Estado cambiado a "En Proceso".',
          duration: 2500,
          color: 'primary'
        });
        await toast.present();
      },
      error: async () => {
        await loader.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo actualizar el estado en el servicio remoto.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }

  async solicitarResolucion(): Promise<void> {
    if (!this.incidencia) return;

    if (this.incidencia.estado === 'resuelta') {
      const toast = await this.toastCtrl.create({
        message: 'Esta incidencia ya se encuentra resuelta.',
        duration: 2000
      });
      await toast.present();
      return;
    }

    // Regla R9: Para marcarla como resuelta, es OBLIGATORIO ingresar una observación
    const alert = await this.alertCtrl.create({
      header: 'Resolver Incidencia',
      subHeader: 'Observación de cierre obligatoria',
      message: 'Detalla las acciones o trabajos realizados por la cuadrilla técnica para dar por resuelta esta incidencia:',
      inputs: [
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: 'Ej: Cuadrilla técnica realizó reparación y asfaltado en la calzada...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Marcar como Resuelta',
          handler: (data) => {
            const observacion = data?.observacion?.trim();
            if (!observacion) {
              this.mostrarToastErrorObservacion();
              return false; // Evita cerrar el diálogo si no ingresa observación
            }
            this.ejecutarResolucion(observacion);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarToastErrorObservacion(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Debe ingresar una observación obligatoria para resolver la incidencia.',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  private async ejecutarResolucion(observacion: string): Promise<void> {
    if (!this.incidencia) return;

    const loader = await this.loadingCtrl.create({ message: 'Registrando resolución en servicio...' });
    await loader.present();

    const id = this.incidencia.id || this.incidencia.codigo;
    this.incidenciasService.updateIncidencia(id, {
      estado: 'resuelta',
      observacion: observacion
    }).subscribe({
      next: async (updated) => {
        await loader.dismiss();
        this.incidencia = updated;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        const toast = await this.toastCtrl.create({
          message: 'Incidencia marcada como RESUELTA exitosamente.',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async () => {
        await loader.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo guardar la resolución en el servicio remoto.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }

  async intentarRegresarAPendiente(): Promise<void> {
    // Caso de prueba para defensa R9: Intentar devolver una incidencia resuelta al estado pendiente
    await this.mostrarAlertaTransicionInvalida();
  }

  private async mostrarAlertaTransicionInvalida(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Acción No Permitida',
      message: 'Regla de negocio (R9): Una incidencia en estado RESUELTA no puede regresar a estado "Pendiente" ni "En Proceso" por auditoría y control de obras públicas.',
      buttons: ['Entendido']
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
