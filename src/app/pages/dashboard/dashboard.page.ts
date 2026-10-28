import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  timeOutline,
  checkmarkCircleOutline,
  bookmarkOutline,
  addCircleOutline,
  businessOutline,
  cloudDoneOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia } from '../../core/models/incidencia.model';

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
    IonBadge
  ],
  template: `
    <ion-header [translucent]="true" class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>UrbanInspect DMQ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="dashboard-content">
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
                <div class="metric-number">{{ metrics.total }}</div>
                <div class="metric-label">Total Registradas</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-pendientes" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="time-outline"></ion-icon></div>
                <div class="metric-number">{{ metrics.pendientes }}</div>
                <div class="metric-label">Pendientes</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-proceso" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="business-outline"></ion-icon></div>
                <div class="metric-number">{{ metrics.enProceso }}</div>
                <div class="metric-label">En Proceso</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card class="metric-card card-resueltas" routerLink="/tabs/incidencias">
              <ion-card-content>
                <div class="metric-icon"><ion-icon name="checkmark-circle-outline"></ion-icon></div>
                <div class="metric-number">{{ metrics.resueltas }}</div>
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
                  <div class="metric-number">{{ metrics.seguimiento }}</div>
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
    .dashboard-content {
      --background: #f8fafc;
    }
    .hero-banner {
      background: linear-gradient(135deg, var(--ion-color-primary, #3880ff) 0%, #1e40af 100%);
      color: #ffffff;
      padding: 24px 20px 28px 20px;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .hero-text h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
    }
    .hero-text p {
      margin: 6px 0 14px 0;
      font-size: 13px;
      opacity: 0.9;
    }
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
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
      }
    }
    .metrics-grid {
      padding: 0 8px;
    }
    .metric-card {
      margin: 6px;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      cursor: pointer;
    }
    .metric-card ion-card-content {
      padding: 16px;
      text-align: center;
    }
    .metric-icon ion-icon {
      font-size: 28px;
      margin-bottom: 6px;
    }
    .metric-number {
      font-size: 26px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }
    .metric-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }
    .card-total { border-top: 4px solid #3b82f6; .metric-icon ion-icon, .metric-number { color: #3b82f6; } }
    .card-pendientes { border-top: 4px solid #f59e0b; .metric-icon ion-icon, .metric-number { color: #f59e0b; } }
    .card-proceso { border-top: 4px solid #8b5cf6; .metric-icon ion-icon, .metric-number { color: #8b5cf6; } }
    .card-resueltas { border-top: 4px solid #10b981; .metric-icon ion-icon, .metric-number { color: #10b981; } }
    .card-seguimiento {
      border-left: 5px solid #f59e0b;
      .row-content {
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: left;
      }
      .metric-icon ion-icon {
        font-size: 36px;
        color: #f59e0b;
        margin: 0;
      }
    }
    .quick-actions {
      padding: 16px;
    }
    .action-btn {
      font-weight: 700;
      --border-radius: 12px;
    }
  `]
})
export class DashboardPage implements OnInit, OnDestroy {
  metrics = {
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltas: 0,
    seguimiento: 0
  };

  private subs = new Subscription();

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
      businessOutline,
      cloudDoneOutline
    });
  }

  ngOnInit(): void {
    this.loadMetrics();

    this.subs.add(
      this.incidenciasService.updates$.subscribe(() => {
        this.loadMetrics();
      })
    );

    this.subs.add(
      this.storageService.markedCodes$.subscribe(codes => {
        this.metrics.seguimiento = codes.length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadMetrics(): void {
    this.incidenciasService.getAllIncidencias().subscribe(list => {
      this.metrics.total = list.length;
      this.metrics.pendientes = list.filter(i => i.estado === 'pendiente').length;
      this.metrics.enProceso = list.filter(i => i.estado === 'en_proceso').length;
      this.metrics.resueltas = list.filter(i => i.estado === 'resuelta').length;
    });
  }
}
