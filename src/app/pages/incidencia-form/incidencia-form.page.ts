import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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

  fotografiaPreview = signal<string | null>(null);
  climaInfo = signal<ClimaInfo | null>(null);
  isLoadingClima = signal(false);
  climaError = signal<string | null>(null);
  isCapturingGps = signal(false);
  isSubmitting = signal(false);

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
      latitud: [-0.1807],
      longitud: [-78.4678]
    });

    // R8: Auto-guardar borrador al modificar cualquier campo
    this.formSub = this.incidenciaForm.valueChanges.subscribe(val => {
      if (this.incidenciaForm.dirty) {
        this.storageService.saveDraft({
          ...val,
          fotografia: this.fotografiaPreview(),
          clima: this.climaInfo()
        });
      }
    });
  }

  // R8: Recuperación de borrador incompleto
  private async checkSavedDraft(): Promise<void> {
    const draft = await this.storageService.getDraft<any>();
    if (!draft || (!draft.descripcion && !draft.direccion && !draft.sector && !draft.fotografia)) {
      return;
    }

    // Si ya fue confirmado desde el inicio de la app, poblar directamente sin repetir alerta
    const state = history.state;
    if (state?.draftConfirmed) {
      this.populateDraft(draft);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Registro Incompleto',
      message: 'Existe un borrador sin guardar de una incidencia anterior. ¿Deseas continuar capturándolo o descartarlo?',
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
            this.populateDraft(draft);
          }
        }
      ]
    });
    await alert.present();
  }

  private populateDraft(draft: any): void {
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
      this.fotografiaPreview.set(draft.fotografia);
    }
    if (draft.clima) {
      this.climaInfo.set(draft.clima);
    }
  }

  // R6: Evidencia fotográfica
  async tomarFotografia(): Promise<void> {
    try {
      const photo = await this.cameraService.capturePhoto();
      if (photo) {
        this.fotografiaPreview.set(photo);
        this.storageService.saveDraft({
          ...this.incidenciaForm.value,
          fotografia: photo,
          clima: this.climaInfo()
        });
      }
    } catch (err: any) {
      if (err.message === 'PERMISO_DENEGADO') {
        const alert = await this.alertCtrl.create({
          header: 'Permiso Denegado',
          message: 'Se denegó el acceso a la cámara. Si la prioridad es Alta, la foto es obligatoria para registrar la incidencia.',
          buttons: ['Entendido']
        });
        await alert.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'No se pudo capturar la imagen. Inténtelo de nuevo.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }

  eliminarFotografia(): void {
    this.fotografiaPreview.set(null);
    this.storageService.saveDraft({
      ...this.incidenciaForm.value,
      fotografia: null,
      clima: this.climaInfo()
    });
  }

  usarFotoMuestra(): void {
    const tipo = this.incidenciaForm.get('tipo')?.value || 'Bache';
    let path = 'assets/incidencias/bache.jpg';

    if (tipo.includes('Luminaria')) path = 'assets/incidencias/luminaria.jpg';
    else if (tipo.includes('Alcantarilla')) path = 'assets/incidencias/alcantarilla.jpg';
    else if (tipo.includes('Señalización')) path = 'assets/incidencias/senal.jpg';
    else if (tipo.includes('parque')) path = 'assets/incidencias/parque.jpg';

    this.fotografiaPreview.set(path);
    this.storageService.saveDraft({
      ...this.incidenciaForm.value,
      fotografia: path,
      clima: this.climaInfo()
    });
  }

  // R7: Ubicación GPS / Manual
  async obtenerUbicacionGps(): Promise<void> {
    this.isCapturingGps.set(true);
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

      // Consultar clima automáticamente con las coordenadas obtenidas (R7 -> R4)
      this.consultarClima();
    } catch (err: any) {
      if (err?.message === 'PERMISO_DENEGADO') {
        const alert = await this.alertCtrl.create({
          header: 'Permiso GPS Denegado',
          message: 'No se concedió acceso a la ubicación. Conforme al requisito R7, puedes ingresar las coordenadas manualmente o usar las de Quito.',
          buttons: [
            { text: 'Ingresar Manualmente', role: 'cancel' },
            {
              text: 'Cargar Coordenadas de Quito',
              handler: () => this.usarCoordenadasQuito()
            }
          ]
        });
        await alert.present();
      } else {
        this.usarCoordenadasQuito();
        const toast = await this.toastCtrl.create({
          message: 'No se obtuvo señal directa de satélite. Se cargaron las coordenadas de Quito (-0.1807, -78.4678).',
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
      }
    } finally {
      this.isCapturingGps.set(false);
    }
  }

  usarCoordenadasQuito(): void {
    this.incidenciaForm.patchValue({
      latitud: -0.1807,
      longitud: -78.4678
    });
    this.consultarClima();
  }

  // R4: Condiciones meteorológicas
  consultarClima(): void {
    const lat = Number(this.incidenciaForm.get('latitud')?.value);
    const lng = Number(this.incidenciaForm.get('longitud')?.value);

    if (isNaN(lat) || isNaN(lng)) {
      this.climaError.set('Ingrese coordenadas válidas para consultar el clima.');
      return;
    }

    this.isLoadingClima.set(true);
    this.climaError.set(null);

    this.weatherService.getClima(lat, lng).subscribe({
      next: info => {
        this.climaInfo.set(info);
        this.isLoadingClima.set(false);
        this.storageService.saveDraft({
          ...this.incidenciaForm.value,
          fotografia: this.fotografiaPreview(),
          clima: info
        });
      },
      error: err => {
        this.isLoadingClima.set(false);
        this.climaError.set(err.message || 'El servicio meteorológico no respondió. Puede continuar.');
      }
    });
  }

  // R5: Guardar con validaciones
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
    if (prioridad === 'alta' && !this.fotografiaPreview()) {
      const alert = await this.alertCtrl.create({
        header: 'Fotografía Obligatoria',
        message: 'Las incidencias con prioridad ALTA exigen obligatoriamente una fotografía de evidencia.',
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
        header: 'Ubicación Requerida para Bache',
        message: 'Para incidencias de tipo Bache es obligatorio registrar coordenadas válidas (por GPS o manuales).',
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
      codigo: '',
      tipo,
      prioridad,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      sector: sector.trim(),
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estado: 'pendiente',
      fotografia: this.fotografiaPreview() || undefined,
      coordenadas: (latitud && longitud) ? { lat: Number(latitud), lng: Number(longitud) } : undefined,
      clima: this.climaInfo() || undefined
    };

    this.incidenciasService.createIncidencia(nuevaIncidencia).subscribe({
      next: async creada => {
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
      error: async (err: any) => {
        await loader.dismiss();
        let detalle = 'No se pudo comunicar con el servicio de oficina. Verifica la conexión.';
        if (err?.status === 413) {
          detalle = 'La fotografía supera el límite de MockAPI (Error 413). Prueba comprimiéndola o con una foto de muestra.';
        }
        const alert = await this.alertCtrl.create({
          header: 'Error al Guardar',
          message: detalle,
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }
}
