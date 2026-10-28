import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonToast,
  InfiniteScrollCustomEvent,
  RefresherCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  refreshOutline,
  alertCircleOutline,
  folderOpenOutline,
  cloudOfflineOutline
} from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { StorageService } from '../../core/services/storage.service';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciaCardComponent } from '../../shared/components/incidencia-card/incidencia-card.component';

@Component({
  selector: 'app-incidencias-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonToast,
    IncidenciaCardComponent
  ],
  templateUrl: './incidencias-list.page.html',
  styleUrls: ['./incidencias-list.page.scss']
})
export class IncidenciasListPage implements OnInit {
  incidencias = signal<Incidencia[]>([]);
  currentPage = signal(1);
  pageSize = 5;
  hasMore = signal(true);
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');

  toastMessage = signal('');
  isToastOpen = signal(false);

  // Filtro reactivo en memoria (R2)
  filteredIncidencias = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.incidencias();
    if (!term) return list;
    return list.filter(i =>
      i.tipo.toLowerCase().includes(term) ||
      i.sector.toLowerCase().includes(term) ||
      i.direccion.toLowerCase().includes(term) ||
      i.codigo.toLowerCase().includes(term) ||
      i.descripcion.toLowerCase().includes(term)
    );
  });

  constructor(
    private incidenciasService: IncidenciasService,
    private storageService: StorageService
  ) {
    addIcons({
      addOutline,
      refreshOutline,
      alertCircleOutline,
      folderOpenOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit(): void {
    this.incidenciasService.updates$.subscribe(() => this.reloadList());
    this.loadIncidencias(1, true);
  }

  ionViewWillEnter(): void {
    if (this.incidencias().length === 0 && !this.isLoading()) {
      this.loadIncidencias(1, true);
    }
  }

  // R2 & R3: Carga remota paginada por lotes (page & limit)
  loadIncidencias(page: number, reset: boolean = false, event?: InfiniteScrollCustomEvent): void {
    if (reset) {
      this.isLoading.set(true);
      this.hasError.set(false);
      this.currentPage.set(1);
    }

    this.incidenciasService.getIncidencias(page, this.pageSize).subscribe({
      next: response => {
        this.isLoading.set(false);
        this.hasError.set(false);

        if (reset) {
          this.incidencias.set(response.incidencias);
        } else {
          // Evitar elementos duplicados por id o código
          const existingIds = new Set(this.incidencias().map(i => i.id || i.codigo));
          const nuevos = response.incidencias.filter(i => !existingIds.has(i.id || i.codigo));
          this.incidencias.update(current => [...current, ...nuevos]);
        }

        this.hasMore.set(response.hasMore);
        this.currentPage.set(page);

        if (event) {
          event.target.complete();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('No se pudo conectar con el servicio de incidencias. Verifica la conexión.');
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  // R3: Scroll infinito
  onIonInfinite(event: Event): void {
    const customEvent = event as InfiniteScrollCustomEvent;
    if (!this.hasMore() || this.isLoading()) {
      customEvent.target.complete();
      return;
    }
    this.loadIncidencias(this.currentPage() + 1, false, customEvent);
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    this.incidenciasService.getIncidencias(1, this.pageSize).subscribe({
      next: response => {
        this.incidencias.set(response.incidencias);
        this.hasMore.set(response.hasMore);
        this.currentPage.set(1);
        this.hasError.set(false);
        customEvent.target.complete();
      },
      error: () => {
        this.hasError.set(true);
        customEvent.target.complete();
      }
    });
  }

  reloadList(): void {
    this.loadIncidencias(1, true);
  }

  // R1: Marcar / Desmarcar para seguimiento local
  async onToggleSeguimiento(incidencia: Incidencia): Promise<void> {
    const code = incidencia.codigo || incidencia.id || '';
    const wasMarked = await this.storageService.toggleMark(code);
    this.toastMessage.set(
      wasMarked
        ? `Incidencia ${code} agregada a seguimiento local.`
        : `Incidencia ${code} removida de seguimiento.`
    );
    this.isToastOpen.set(true);
  }

  isIncidenciaMarked(incidencia: Incidencia): boolean {
    return this.storageService.isMarked(incidencia.codigo, incidencia.id);
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm.set(event.detail.value || '');
  }
}
