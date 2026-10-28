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
  templateUrl: './incidencia-card.component.html',
  styleUrls: ['./incidencia-card.component.scss']
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
