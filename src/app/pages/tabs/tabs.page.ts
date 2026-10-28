import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  home,
  listOutline,
  list,
  bookmarkOutline,
  bookmark,
  addCircleOutline,
  addCircle
} from 'ionicons/icons';
import { StorageService } from '../../core/services/storage.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge
  ],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="dashboard">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="incidencias">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>Incidencias</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="nueva" class="nueva-tab-btn">
          <ion-icon name="add-circle"></ion-icon>
          <ion-label>Registrar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="seguimiento">
          <ion-icon name="bookmark-outline"></ion-icon>
          <ion-label>Seguimiento</ion-label>
          @if ((markedCount$ | async); as count) {
            @if (count > 0) {
              <ion-badge color="warning">{{ count }}</ion-badge>
            }
          }
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .custom-tab-bar {
      --background: #ffffff;
      border-top: 1px solid #e2e8f0;
      height: 60px;
    }
    .nueva-tab-btn {
      --color-selected: var(--ion-color-secondary, #3dc2ff);
      ion-icon {
        font-size: 28px;
        color: var(--ion-color-primary, #3880ff);
      }
    }
  `]
})
export class TabsPage {
  markedCount$: Observable<number>;

  constructor(private storageService: StorageService) {
    addIcons({
      homeOutline,
      home,
      listOutline,
      list,
      bookmarkOutline,
      bookmark,
      addCircleOutline,
      addCircle
    });
    this.markedCount$ = this.storageService.markedCodes$.pipe(
      map(codes => codes.length)
    );
  }
}
