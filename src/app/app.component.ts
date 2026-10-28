import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, AlertController } from '@ionic/angular';
import { StorageService } from './core/services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarBorradorAlInicio();
  }

  // R8: Al reiniciar la app, si existe un registro incompleto ofrece continuar o descartar
  private async verificarBorradorAlInicio(): Promise<void> {
    const draft = await this.storageService.getDraft<any>();
    if (draft && (draft.descripcion || draft.direccion || draft.sector || draft.fotografia)) {
      const alert = await this.alertCtrl.create({
        header: 'Registro Incompleto',
        message: 'Existe un registro de incidencia pendiente de completar. ¿Deseas continuar capturándolo o descartarlo?',
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
              this.router.navigate(['/tabs/nueva'], { state: { draftConfirmed: true } });
            }
          }
        ]
      });
      await alert.present();
    }
  }
}
