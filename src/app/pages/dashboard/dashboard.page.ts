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
  template: `
    <ion-header [translucent]="true" class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>UrbanInspect DMQ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="dashboard-content">
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content pullingText="Desliza para actualizar indicadores..." refreshingSpinner="circles">
        </ion-refresher-content>
      </ion-refresher>

      <div class="hero-banner">
        <div class="hero-text">
          <h2>Inspección de Infraestructura</h2>
          <p>Municipio del Distrito Metropolitano de Quito</p>
        </div>
        <ion-badge color="light" class="mode-badge">
          <ion-icon name="business-outline"></ion-icon>
          Inspector DMQ-04
        </ion-badge>
      </div>

      <!-- Métricas / Indicadores (R10) -->
      <div class="section-title">
        <h3>Indicadores Operativos</h3>
      </div>

      <ion-grid class="metrics-grid">
        <ion-row>
          <ion-col size="6">
            <ion-card class="metric-card card-total" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="warning-outline"></ion-icon></div>
                <div class="metric-number">{{ total() }}</div>
                <div class="metric-label">Total Registradas</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-pendientes" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="time-outline"></ion-icon></div>
                <div class="metric-number">{{ pendientes() }}</div>
                <div class="metric-label">Pendientes</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-proceso" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="business-outline"></ion-icon></div>
                <div class="metric-number">{{ enProceso() }}</div>
                <div class="metric-label">En Proceso</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-resueltas" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="checkmark-circle-outline"></ion-icon></div>
                <div class="metric-number">{{ resueltas() }}</div>
                <div class="metric-label">Resueltas</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="12">
            <ion-card class="metric-card card-seguimiento" routerLink="/tabs/seguimiento">
              <ion-card-content class="row-content">
                <div class="metric-icon"><ion-icon name="bookmark-outline"></ion-icon></div>
                <div class="metric-info">
                  <div class="metric-number">{{ seguimiento() }}</div>
                  <div class="metric-label">En Seguimiento Local (este dispositivo)</div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="quick-actions">
        <ion-button expand="block" color="secondary" size="large" routerLink="/tabs/nueva" class="action-btn">
          <ion-icon name="add-circle-outline" slot="start"></ion-icon>
          Registrar Nueva Incidencia
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .dashboard-content { --background: #f8fafc; }
    .hero-banner {
      background: linear-gradient(135deg, var(--ion-color-primary, #3880ff) 0%, #1e40af 100%);
      color: #ffffff;
      padding: 24px 20px 28px 20px;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .hero-text h2 { margin: 0; font-size: 22px; font-weight: 800; }
    .hero-text p { margin: 6px 0 14px 0; font-size: 13px; opacity: 0.9; }
    .mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
    }
    .section-title {
      padding: 20px 16px 8px 16px;
      h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
    }
    .metrics-grid { padding: 0 8px; }
    .metric-card {
      margin: 6px;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      cursor: pointer;
    }
    .metric-card ion-card-content { padding: 16px; text-align: center; }
    .metric-icon ion-icon { font-size: 28px; margin-bottom: 6px; }
    .metric-number { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
    .metric-label { font-size: 12px; font-weight: 600; color: #64748b; }
    .card-total { border-top: 4px solid #3b82f6; .metric-icon ion-icon, .metric-number { color: #3b82f6; } }
    .card-pendientes { border-top: 4px solid #f59e0b; .metric-icon ion-icon, .metric-number { color: #f59e0b; } }
    .card-proceso { border-top: 4px solid #8b5cf6; .metric-icon ion-icon, .metric-number { color: #8b5cf6; } }
    .card-resueltas { border-top: 4px solid #10b981; .metric-icon ion-icon, .metric-number { color: #10b981; } }
    .card-seguimiento {
      border-left: 5px solid #f59e0b;
      .row-content { display: flex; align-items: center; gap: 16px; text-align: left; }
      .metric-icon ion-icon { font-size: 36px; color: #f59e0b; margin: 0; }
    }
    .quick-actions { padding: 16px; }
    .action-btn { font-weight: 700; --border-radius: 12px; }
  `]
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
