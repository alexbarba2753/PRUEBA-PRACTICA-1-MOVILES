import { Component, computed } from '@angular/core';
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
  listOutline,
  bookmarkOutline,
  addCircle
} from 'ionicons/icons';
import { StorageService } from '../../core/services/storage.service';

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
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss']
})
export class TabsPage {
  // Conteo reactivo de incidencias en seguimiento local (R1)
  markedCount = computed(() => this.storageService.markedCodes().length);

  constructor(private storageService: StorageService) {
    addIcons({ homeOutline, listOutline, bookmarkOutline, addCircle });
  }
}
