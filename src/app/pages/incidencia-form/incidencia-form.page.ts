import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  trashOutline,
  cloudOutline,
  warningOutline,
  checkmarkCircleOutline,
  navigateOutline,
  alertCircleOutline,
  imageOutline,
  refreshOutline,
  locateOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { WeatherService } from '../../core/services/weather.service';
import { CameraService } from '../../core/services/camera.service';
import { LocationService } from '../../core/services/location.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia, ClimaInfo, TipoIncidencia, PrioridadIncidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-incidencia-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner
  ],
  templateUrl: './incidencia-form.page.html',
  styleUrls: ['./incidencia-form.page.scss']
})
export class IncidenciaFormPage implements OnInit, OnDestroy {
  incidenciaForm!: FormGroup;

  fotografiaPreview: string | null = null;
  climaInfo: ClimaInfo | null = null;
  isLoadingClima = false;
  climaError: string | null = null;
  isCapturingGps = false;

  isSubmitting = false;

  tiposDisponibles: TipoIncidencia[] = [
    'Bache',
    'Luminaria dañada',
    'Señalización deteriorada',
    'Alcantarilla obstruida',
    'Daño en parque'
  ];

  prioridades: PrioridadIncidencia[] = ['baja', 'media', 'alta'];

  private formSub = new Subscription();

  constructor(
    private fb: FormBuilder,
    private incidenciasService: IncidenciasService,
    private weatherService: WeatherService,
    private cameraService: CameraService,
    private locationService: LocationService,
    private storageService: StorageService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      cameraOutline,
      trashOutline,
      cloudOutline,
      warningOutline,
      checkmarkCircleOutline,
      navigateOutline,
      alertCircleOutline,
      imageOutline,
      refreshOutline,
      locateOutline
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.checkSavedDraft();
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }

  private initForm(): void {
    this.incidenciaForm = this.fb.group({
      tipo: ['Bache', Validators.required],
      prioridad: ['media', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(8)]],
      direccion: ['', Validators.required],
      sector: ['', Validators.required],
      latitud: [-0.1807], // Coordenadas predeterminadas de Quito
      longitud: [-78.4678]
    });

    // Auto-guardar borrador al modificar campos (R8)
    this.formSub = this.incidenciaForm.valueChanges.subscribe(val => {
      if (this.incidenciaForm.dirty) {
        this.storageService.saveDraft({
          ...val,
          fotografia: this.fotografiaPreview,
          clima: this.climaInfo
        });
      }
    });
  }

  // ==========================================
  // R8: RECUPERACIÓN DE BORRADOR INCOMPLETO
  // ==========================================
  private async checkSavedDraft(): Promise<void> {
    const draft = await this.storageService.getDraft<any>();
    if (draft && (draft.descripcion || draft.direccion || draft.sector || draft.fotografia)) {
      const alert = await this.alertCtrl.create({
        header: 'Registro Incompleto',
        message: 'Se encontró un borrador sin guardar de una incidencia anterior. ¿Deseas continuar capturándolo o descartarlo?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Descartar',
            role: 'destructive',
            handler: () => {
              this.storageService.clearDraft();
            }
          },
          {
            text: 'Continuar',
            handler: () => {
              this.incidenciaForm.patchValue({
                tipo: draft.tipo || 'Bache',
                prioridad: draft.prioridad || 'media',
                descripcion: draft.descripcion || '',
                direccion: draft.direccion || '',
                sector: draft.sector || '',
                latitud: draft.latitud ?? -0.1807,
                longitud: draft.longitud ?? -78.4678
              });
              if (draft.fotografia) {
                this.fotografiaPreview = draft.fotografia;
              }
              if (draft.clima) {
                this.climaInfo = draft.clima;
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // ==========================================
  // R6: EVIDENCIA FOTOGRÁFICA
  // ==========================================
  async tomarFotografia(): Promise<void> {
    try {
      const photoDataUrl = await this.cameraService.capturePhoto();
      if (photoDataUrl) {
        this.fotografiaPreview = photoDataUrl;
        // Guardar borrador actualizado
        this.storageService.saveDraft({
          ...this.incidenciaForm.value,
          fotografia: this.fotografiaPreview,
          clima: this.climaInfo
        });
      }
      // Si el usuario canceló, photoDataUrl es null y los demás campos quedan intactos
    } catch (err: any) {
      if (err.message === 'PERMISO_DENEGADO') {
        const alert = await this.alertCtrl.create({
          header: 'Permiso de Cámara Denegado',
          message: 'Se denegó el acceso a la cámara o galería. Si la incidencia es de prioridad alta, la fotografía es estrictamente obligatoria para registrarla.',
          buttons: ['Entendido']
        });
        await alert.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'No se pudo capturar la imagen. Inténtelo de nuevo.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }

  eliminarFotografia(): void {
    this.fotografiaPreview = null;
    this.storageService.saveDraft({
      ...this.incidenciaForm.value,
      fotografia: null,
      clima: this.climaInfo
    });
  }

  // ==========================================
  // R7: UBICACIÓN DE LA INCIDENCIA (GPS / MANUAL)
  // ==========================================
  async obtenerUbicacionGps(): Promise<void> {
    this.isCapturingGps = true;
    try {
      const coords = await this.locationService.getCurrentPosition();
      this.incidenciaForm.patchValue({
        latitud: coords.lat,
        longitud: coords.lng
      });

      const toast = await this.toastCtrl.create({
        message: `Coordenadas capturadas: ${coords.lat}, ${coords.lng}`,
        duration: 2500,
        color: 'success'
      });
      await toast.present();

      // Consultar clima automáticamente con las coordenadas recién obtenidas (R7 -> R4)
      this.consultarClima();
    } catch (error: any) {
      if (error?.message === 'PERMISO_DENEGADO') {
        const alert = await this.alertCtrl.create({
          header: 'Permiso de Ubicación Denegado',
          message: 'No se concedió acceso al GPS. Puede ingresar manualmente las coordenadas numéricas válidas en los campos de Latitud y Longitud.',
          buttons: ['Entendido']
        });
        await alert.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'No se pudo obtener señal GPS. Ingrese las coordenadas manualmente.',
          duration: 3500,
          color: 'warning'
        });
        await toast.present();
      }
    } finally {
      this.isCapturingGps = false;
    }
  }

  // ==========================================
  // R4: CONSULTA DE CONDICIONES METEOROLÓGICAS
  // ==========================================
  consultarClima(): void {
    const lat = Number(this.incidenciaForm.get('latitud')?.value);
    const lng = Number(this.incidenciaForm.get('longitud')?.value);

    if (isNaN(lat) || isNaN(lng)) {
      this.climaError = 'Ingrese coordenadas numéricas válidas para consultar el clima.';
      return;
    }

    this.isLoadingClima = true;
    this.climaError = null;

    this.weatherService.getClima(lat, lng).subscribe({
      next: info => {
        this.climaInfo = info;
        this.isLoadingClima = false;
        // Guardar en borrador
        this.storageService.saveDraft({
          ...this.incidenciaForm.value,
          fotografia: this.fotografiaPreview,
          clima: this.climaInfo
        });
      },
      error: err => {
        this.isLoadingClima = false;
        this.climaError = err.message || 'El servicio meteorológico no respondió. Puede continuar con el registro.';
      }
    });
  }

  // ==========================================
  // R5: GUARDAR INCIDENCIA CON VALIDACIONES
  // ==========================================
  async onSubmit(): Promise<void> {
    if (this.incidenciaForm.invalid) {
      this.incidenciaForm.markAllAsTouched();
      const alert = await this.alertCtrl.create({
        header: 'Campos Incompletos',
        message: 'Por favor completa todos los campos requeridos (descripción, dirección y sector).',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const { tipo, prioridad, descripcion, direccion, sector, latitud, longitud } = this.incidenciaForm.value;

    // Regla R5 / R6: Si prioridad es ALTA, la fotografía es OBLIGATORIA
    if (prioridad === 'alta' && !this.fotografiaPreview) {
      const alert = await this.alertCtrl.create({
        header: 'Fotografía Obligatoria',
        message: 'Las incidencias con prioridad ALTA requieren obligatoriamente una fotografía de evidencia para proceder.',
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    // Regla R7: Si tipo es BACHE, la ubicación es OBLIGATORIA (GPS o manual válido)
    const latNum = Number(latitud);
    const lngNum = Number(longitud);
    const coordsValidas = !isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180 && (latNum !== 0 || lngNum !== 0);

    if (tipo === 'Bache' && !coordsValidas) {
      const alert = await this.alertCtrl.create({
        header: 'Ubicación Obligatoria para Bache',
        message: 'Para incidencias de tipo Bache es obligatorio registrar coordenadas válidas (obtenidas por GPS o ingresadas manualmente: Latitud entre -90 y 90, Longitud entre -180 y 180).',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const loader = await this.loadingCtrl.create({
      message: 'Guardando incidencia en servicio de oficina...'
    });
    await loader.present();

    const nuevaIncidencia: Incidencia = {
      codigo: '', // Autogenerado por el servicio
      tipo,
      prioridad,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      sector: sector.trim(),
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estado: 'pendiente',
      fotografia: this.fotografiaPreview || undefined,
      coordenadas: (latitud && longitud) ? { lat: Number(latitud), lng: Number(longitud) } : undefined,
      clima: this.climaInfo || undefined
    };

    this.incidenciasService.createIncidencia(nuevaIncidencia).subscribe({
      next: async (creada) => {
        await loader.dismiss();
        await this.storageService.clearDraft();

        const toast = await this.toastCtrl.create({
          message: `¡Incidencia ${creada.codigo} registrada con éxito!`,
          duration: 3000,
          color: 'success'
        });
        await toast.present();

        this.router.navigate(['/tabs/incidencias']);
      },
      error: async () => {
        await loader.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error al Guardar',
          message: 'No se pudo comunicar con el servicio de oficina. Verifica la conexión a la API.',
          buttons: ['Reintentar']
        });
        await alert.present();
      }
    });
  }
}
