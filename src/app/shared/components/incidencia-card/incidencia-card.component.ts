import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookmark,
  bookmarkOutline,
  locationOutline,
  calendarOutline
} from 'ionicons/icons';
import { Incidencia } from '../../../core/models/incidencia.model';

@Component({
  selector: 'app-incidencia-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonIcon
  ],
  template: `
    <ion-card class="incidencia-card" [routerLink]="['/incidencias', incidencia.id || incidencia.codigo]">
      <!-- Foto de evidencia (R2, R6) -->
      @if (incidencia.fotografia) {
        <div class="card-image-wrapper">
          <img [src]="incidencia.fotografia" [alt]="incidencia.tipo" class="card-image" loading="lazy" />
          <div class="priority-chip" [class]="'priority-' + (incidencia.prioridad || 'media')">
            {{ incidencia.prioridad | uppercase }}
          </div>
        </div>
      }

      <ion-card-header>
        <div class="header-top-row">
          <span class="codigo-tag">{{ incidencia.codigo }}</span>
          
          <div class="actions-right">
            <ion-badge [color]="getEstadoColor(incidencia.estado)" class="status-badge">
              {{ formatEstado(incidencia.estado) }}
            </ion-badge>
            <ion-button
              fill="clear"
              size="small"
              class="bookmark-btn"
              (click)="onToggleSeguimiento($event)">
              <ion-icon
                [name]="isMarked ? 'bookmark' : 'bookmark-outline'"
                [color]="isMarked ? 'warning' : 'medium'">
              </ion-icon>
            </ion-button>
          </div>
        </div>

        <ion-card-title class="card-title">{{ incidencia.tipo }}</ion-card-title>
        <ion-card-subtitle class="card-subtitle">
          <ion-icon name="location-outline"></ion-icon>
          <span>{{ incidencia.sector }} &bull; {{ incidencia.direccion }}</span>
        </ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        <p class="description">{{ incidencia.descripcion }}</p>

        <div class="card-footer-meta">
          <div class="meta-item">
            <ion-icon name="calendar-outline"></ion-icon>
            <span>{{ incidencia.fecha }}</span>
          </div>

          @if (incidencia.clima) {
            <div class="meta-item clima-pill" [class.clima-alerta]="incidencia.clima.advertenciaLluvia">
              <span>{{ incidencia.clima.temperatura }}°C &bull; {{ incidencia.clima.precipitacion }} mm</span>
            </div>
          }
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .incidencia-card {
      margin: 12px 16px;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
      background: var(--ion-card-background, #ffffff);
      overflow: hidden;
      cursor: pointer;
    }
    .card-image-wrapper {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: #e9ecef;
    }
    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .priority-chip {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .priority-alta { background: #e53935; }
    .priority-media { background: #fb8c00; }
    .priority-baja { background: #43a047; }

    .header-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .codigo-tag {
      font-size: 12px;
      font-weight: 700;
      color: var(--ion-color-primary, #3880ff);
      background: rgba(56, 128, 255, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      font-family: monospace;
    }
    .actions-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .bookmark-btn {
      --padding-start: 4px;
      --padding-end: 4px;
      margin: 0;
      font-size: 20px;
    }
    .status-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: capitalize;
    }
    .card-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--ion-text-color, #222428);
      margin-top: 4px;
      margin-bottom: 4px;
    }
    .card-subtitle {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--ion-color-medium, #666666);
    }
    .card-subtitle ion-icon { font-size: 15px; flex-shrink: 0; }
    .description {
      font-size: 14px;
      color: var(--ion-color-step-700, #444444);
      margin: 8px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid var(--ion-color-light-shade, #f0f0f0);
      font-size: 12px;
      color: var(--ion-color-medium, #777777);
    }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .clima-pill {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
    }
    .clima-alerta {
      background: #fee2e2;
      color: #b91c1c;
      font-weight: 600;
    }
  `]
})
export class IncidenciaCardComponent {
  @Input({ required: true }) incidencia!: Incidencia;
  @Input() isMarked = false;
  @Output() toggleSeguimiento = new EventEmitter<Incidencia>();

  constructor() {
    addIcons({ bookmark, bookmarkOutline, locationOutline, calendarOutline });
  }

  onToggleSeguimiento(event: Event): void {
    event.stopPropagation();
    this.toggleSeguimiento.emit(this.incidencia);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  formatEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En proceso';
      case 'resuelta': return 'Resuelta';
      default: return estado;
    }
  }
}
