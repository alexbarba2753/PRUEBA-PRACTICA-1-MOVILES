import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  timeOutline,
  checkmarkCircleOutline,
  bookmarkOutline,
  addCircleOutline,
  businessOutline
} from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonRefresher,
    IonRefresherContent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  // Señales reactivas para las métricas del Dashboard (R10)
  total = signal(0);
  pendientes = signal(0);
  enProceso = signal(0);
  resueltas = signal(0);
  seguimiento = computed(() => this.storageService.markedCodes().length);

  constructor(
    private incidenciasService: IncidenciasService,
    private storageService: StorageService
  ) {
    addIcons({
      warningOutline,
      timeOutline,
      checkmarkCircleOutline,
      bookmarkOutline,
      addCircleOutline,
      businessOutline
    });
  }

  ngOnInit(): void {
    this.loadMetrics();
    this.incidenciasService.updates$.subscribe(() => this.loadMetrics());
  }

  ionViewWillEnter(): void {
    this.loadMetrics();
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    this.incidenciasService.getAllIncidencias().subscribe({
      next: list => {
        this.updateCounters(list);
        customEvent.target.complete();
      },
      error: () => customEvent.target.complete()
    });
  }

  loadMetrics(): void {
    this.incidenciasService.getAllIncidencias().subscribe(list => {
      this.updateCounters(list);
    });
  }

  private updateCounters(list: any[]): void {
    this.total.set(list.length);
    this.pendientes.set(list.filter(i => i.estado === 'pendiente').length);
    this.enProceso.set(list.filter(i => i.estado === 'en_proceso').length);
    this.resueltas.set(list.filter(i => i.estado === 'resuelta').length);
  }
}
