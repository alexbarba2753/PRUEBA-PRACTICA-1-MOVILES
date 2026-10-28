import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { Subscription } from 'rxjs';
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
export class SeguimientoListPage implements OnInit, OnDestroy {
  incidencias: Incidencia[] = [];
  markedCodes: string[] = [];
  isLoading = true;

  toastMessage = '';
  isToastOpen = false;

  private subs = new Subscription();

  constructor(
    private incidenciasService: IncidenciasService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
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
    this.subs.add(
      this.storageService.markedCodes$.subscribe(codes => {
        this.markedCodes = codes;
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.incidenciasService.updates$.subscribe(() => {
        this.loadSeguimiento();
      })
    );
  }

  ionViewWillEnter(): void {
    this.loadSeguimiento();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadSeguimiento(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.incidenciasService.getSeguimientoIncidencias().subscribe({
      next: items => {
        this.incidencias = items;
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onRefresh(event: Event): void {
    const customEvent = event as RefresherCustomEvent;
    this.incidenciasService.getSeguimientoIncidencias().subscribe({
      next: items => {
        this.incidencias = items;
        customEvent.target.complete();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        customEvent.target.complete();
        this.cdr.markForCheck();
      }
    });
  }

  async onToggleSeguimiento(incidencia: Incidencia): Promise<void> {
    const code = incidencia.codigo || incidencia.id || '';
    await this.storageService.toggleMark(code);
    this.incidencias = this.incidencias.filter(i =>
      i.codigo !== code && i.id !== code
    );
    this.toastMessage = `Incidencia ${code} removida de seguimiento.`;
    this.isToastOpen = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
