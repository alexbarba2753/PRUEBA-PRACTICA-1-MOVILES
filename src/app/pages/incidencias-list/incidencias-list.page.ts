import { Component, OnInit, OnDestroy } from '@angular/core';
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
  searchOutline,
  folderOpenOutline,
  bookmark,
  bookmarkOutline,
  cloudOfflineOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
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
export class IncidenciasListPage implements OnInit, OnDestroy {
  incidencias: Incidencia[] = [];
  filteredIncidencias: Incidencia[] = [];
  markedCodes: string[] = [];

  currentPage = 1;
  pageSize = 5;
  hasMore = true;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  searchTerm = '';

  toastMessage = '';
  isToastOpen = false;

  private subs = new Subscription();

  constructor(
    private incidenciasService: IncidenciasService,
    private storageService: StorageService
  ) {
    addIcons({
      addOutline,
      refreshOutline,
      alertCircleOutline,
      searchOutline,
      folderOpenOutline,
      bookmark,
      bookmarkOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit(): void {
    this.subs.add(
      this.storageService.markedCodes$.subscribe(codes => {
        this.markedCodes = codes;
      })
    );

    // Escuchar actualizaciones globales para refrescar la lista si se crea o edita una incidencia
    this.subs.add(
      this.incidenciasService.updates$.subscribe(() => {
        this.reloadList();
      })
    );

    this.loadIncidencias(1, true);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadIncidencias(page: number, reset: boolean = false, event?: InfiniteScrollCustomEvent): void {
    if (reset) {
      this.isLoading = true;
      this.hasError = false;
      this.currentPage = 1;
    }

    this.incidenciasService.getIncidencias(page, this.pageSize).subscribe({
      next: response => {
        this.isLoading = false;
        this.hasError = false;

        if (reset) {
          this.incidencias = response.incidencias;
        } else {
          // Evitar duplicados por id o código
          const existingIds = new Set(this.incidencias.map(i => i.id || i.codigo));
          const nuevos = response.incidencias.filter(i => !existingIds.has(i.id || i.codigo));
          this.incidencias = [...this.incidencias, ...nuevos];
        }

        this.hasMore = response.hasMore;
        this.currentPage = page;
        this.applyFilter();

        if (event) {
          event.target.complete();
        }
      },
      error: err => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'No se pudo conectar con el servicio de incidencias. Verifica la conexión o la URL.';
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  onIonInfinite(event: Event): void {
    const customEvent = event as InfiniteScrollCustomEvent;
    if (!this.hasMore || this.isLoading) {
      customEvent.target.complete();
      return;
    }
    this.loadIncidencias(this.currentPage + 1, false, customEvent);
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    this.incidenciasService.getIncidencias(1, this.pageSize).subscribe({
      next: response => {
        this.incidencias = response.incidencias;
        this.hasMore = response.hasMore;
        this.currentPage = 1;
        this.hasError = false;
        this.applyFilter();
        customEvent.target.complete();
      },
      error: () => {
        this.hasError = true;
        customEvent.target.complete();
      }
    });
  }

  reloadList(): void {
    this.loadIncidencias(1, true);
  }

  async onToggleSeguimiento(incidencia: Incidencia): Promise<void> {
    const code = incidencia.codigo || incidencia.id || '';
    const wasMarked = await this.storageService.toggleMark(code);
    this.toastMessage = wasMarked
      ? `Incidencia ${code} agregada a seguimiento local.`
      : `Incidencia ${code} removida de seguimiento.`;
    this.isToastOpen = true;
  }

  isIncidenciaMarked(incidencia: Incidencia): boolean {
    const code = incidencia.codigo || incidencia.id || '';
    return this.markedCodes.includes(code);
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredIncidencias = [...this.incidencias];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredIncidencias = this.incidencias.filter(i =>
      i.tipo.toLowerCase().includes(term) ||
      i.sector.toLowerCase().includes(term) ||
      i.direccion.toLowerCase().includes(term) ||
      i.codigo.toLowerCase().includes(term) ||
      i.descripcion.toLowerCase().includes(term)
    );
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilter();
  }
}
