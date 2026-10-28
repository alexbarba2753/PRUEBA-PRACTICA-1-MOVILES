import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incidencia, IncidenciasPaginadasResponse } from '../models/incidencia.model';
import { SEED_INCIDENCIAS } from '../data/seed-incidencias';
import { StorageService } from './storage.service';

const LOCAL_INCIDENCIAS_CACHE = 'urbaninspect_local_incidencias_store';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  private localStore: Incidencia[] = [];
  private updatesSubject = new BehaviorSubject<void>(undefined);
  public updates$ = this.updatesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.initLocalStore();
  }

  private initLocalStore(): void {
    const saved = localStorage.getItem(LOCAL_INCIDENCIAS_CACHE);
    if (saved) {
      try {
        this.localStore = JSON.parse(saved);
      } catch {
        this.localStore = [...SEED_INCIDENCIAS];
      }
    } else {
      this.localStore = [...SEED_INCIDENCIAS];
      localStorage.setItem(LOCAL_INCIDENCIAS_CACHE, JSON.stringify(this.localStore));
    }
  }

  private saveLocalStore(): void {
    localStorage.setItem(LOCAL_INCIDENCIAS_CACHE, JSON.stringify(this.localStore));
    this.updatesSubject.next();
  }

  public get isMockApiConfigured(): boolean {
    return !!environment.mockApiUrl && environment.mockApiUrl.trim().length > 0;
  }

  // ==========================================
  // R2 & R3: CONSULTA Y PAGINACIÓN REMOTA
  // ==========================================

  getIncidencias(page: number = 1, limit: number = 5): Observable<IncidenciasPaginadasResponse> {
    if (this.isMockApiConfigured) {
      const url = `${environment.mockApiUrl}?page=${page}&limit=${limit}`;
      return this.http.get<Incidencia[]>(url).pipe(
        map(items => {
          const list = Array.isArray(items) ? items : [];
          return {
            incidencias: list,
            hasMore: list.length === limit,
            page
          };
        }),
        catchError((error: HttpErrorResponse) => {
          // MockAPI responde 404 "Not found" cuando se solicita una página que no tiene registros
          if (error.status === 404) {
            return of({
              incidencias: [],
              hasMore: false,
              page
            });
          }
          return throwError(() => error);
        })
      );
    }

    // Modo simulado local con paginación real (para pruebas antes de pegar la URL de MockAPI)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const slice = this.localStore.slice(startIndex, endIndex);
    const hasMore = endIndex < this.localStore.length;

    return of({
      incidencias: slice,
      hasMore,
      page,
      total: this.localStore.length
    });
  }

  // Obtener todas las incidencias (usado para métricas del dashboard o filtrado local)
  getAllIncidencias(): Observable<Incidencia[]> {
    if (this.isMockApiConfigured) {
      return this.http.get<Incidencia[]>(environment.mockApiUrl).pipe(
        map(items => Array.isArray(items) ? items : []),
        catchError(() => of([]))
      );
    }
    return of([...this.localStore]);
  }

  getIncidenciaById(id: string): Observable<Incidencia> {
    if (this.isMockApiConfigured) {
      return this.http.get<Incidencia>(`${environment.mockApiUrl}/${id}`);
    }
    const found = this.localStore.find(i => i.id === id || i.codigo === id);
    if (found) {
      return of({ ...found });
    }
    return throwError(() => new Error('Incidencia no encontrada'));
  }

  // ==========================================
  // R5: REGISTRO DE INCIDENCIAS
  // ==========================================

  createIncidencia(incidencia: Incidencia): Observable<Incidencia> {
    // Si no trae código generado, generamos uno correlativo
    if (!incidencia.codigo) {
      const nextNum = this.localStore.length + 1;
      incidencia.codigo = `INC-2026-${String(nextNum).padStart(3, '0')}`;
    }
    if (!incidencia.fecha) {
      incidencia.fecha = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    if (!incidencia.estado) {
      incidencia.estado = 'pendiente';
    }

    if (this.isMockApiConfigured) {
      return this.http.post<Incidencia>(environment.mockApiUrl, incidencia).pipe(
        tap(created => {
          this.localStore.unshift(created);
          this.saveLocalStore();
        })
      );
    }

    // Modo local
    const newItem: Incidencia = {
      ...incidencia,
      id: String(Date.now())
    };
    this.localStore.unshift(newItem);
    this.saveLocalStore();
    return of(newItem);
  }

  // ==========================================
  // R9: ACTUALIZACIÓN Y PERSISTENCIA DE ESTADO
  // ==========================================

  updateIncidencia(id: string, partial: Partial<Incidencia>): Observable<Incidencia> {
    if (this.isMockApiConfigured) {
      return this.http.put<Incidencia>(`${environment.mockApiUrl}/${id}`, partial).pipe(
        tap(updated => {
          const idx = this.localStore.findIndex(i => i.id === id);
          if (idx > -1) {
            this.localStore[idx] = { ...this.localStore[idx], ...updated };
            this.saveLocalStore();
          }
        })
      );
    }

    // Modo local
    const idx = this.localStore.findIndex(i => i.id === id || i.codigo === id);
    if (idx > -1) {
      this.localStore[idx] = { ...this.localStore[idx], ...partial };
      this.saveLocalStore();
      return of({ ...this.localStore[idx] });
    }
    return throwError(() => new Error('Incidencia no encontrada'));
  }

  // ==========================================
  // R1: CONSULTA DE SEGUIMIENTO LOCAL
  // ==========================================

  getSeguimientoIncidencias(): Observable<Incidencia[]> {
    return this.storageService.markedCodes$.pipe(
      switchMap(codes => {
        if (!codes || codes.length === 0) {
          return of([]);
        }
        return this.getAllIncidencias().pipe(
          map(all => all.filter(inc => codes.includes(inc.codigo) || (inc.id && codes.includes(inc.id))))
        );
      })
    );
  }
}
