import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonSpinner,
  IonIcon,
  IonButton,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookmarkOutline,
  bookmark,
  informationCircleOutline,
  refreshOutline,
  listOutline
} from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciaCardComponent } from '../../shared/components/incidencia-card/incidencia-card.component';

@Component({
  selector: 'app-seguimiento-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonSpinner,
    IonIcon,
    IonButton,
    IonToast,
    IonRefresher,
    IonRefresherContent,
    IncidenciaCardComponent
  ],
  templateUrl: './seguimiento-list.page.html',
  styleUrls: ['./seguimiento-list.page.scss']
})
export class SeguimientoListPage implements OnInit {
  incidencias = signal<Incidencia[]>([]);
  isLoading = signal(true);
  toastMessage = signal('');
  isToastOpen = signal(false);

  constructor(
    private incidenciasService: IncidenciasService,
    private storageService: StorageService
  ) {
    addIcons({
      bookmarkOutline,
      bookmark,
      informationCircleOutline,
      refreshOutline,
      listOutline
    });
  }

  ngOnInit(): void {
    this.incidenciasService.updates$.subscribe(() => this.loadSeguimiento());
  }

  ionViewWillEnter(): void {
    this.loadSeguimiento();
  }

  // R1: Consulta únicamente las incidencias marcadas en el dispositivo
  loadSeguimiento(): void {
    this.isLoading.set(true);
    this.incidenciasService.getSeguimientoIncidencias().subscribe({
      next: items => {
        this.incidencias.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    this.incidenciasService.getSeguimientoIncidencias().subscribe({
      next: items => {
        this.incidencias.set(items);
        customEvent.target.complete();
      },
      error: () => customEvent.target.complete()
    });
  }

  // R1: Al desmarcar una incidencia, desaparece del seguimiento sin tocar la API remota
  async onToggleSeguimiento(incidencia: Incidencia): Promise<void> {
    const code = incidencia.codigo || incidencia.id || '';
    await this.storageService.toggleMark(code);
    this.incidencias.update(list =>
      list.filter(i => i.codigo !== code && i.id !== code)
    );
    this.toastMessage.set(`Incidencia ${code} removida de seguimiento.`);
    this.isToastOpen.set(true);
  }
}
