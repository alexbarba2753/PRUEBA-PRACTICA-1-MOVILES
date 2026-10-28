import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incidencia, IncidenciasPaginadasResponse } from '../models/incidencia.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  // Notifica creaciones o actualizaciones para refrescar vistas reactivamente
  private updatesSubject = new Subject<void>();
  public updates$ = this.updatesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private get apiUrl(): string {
    return environment.mockApiUrl;
  }

  // ==========================================
  // R2 & R3: CONSULTA Y PAGINACIÓN REMOTA
  // ==========================================

  getIncidencias(page: number = 1, limit: number = 5): Observable<IncidenciasPaginadasResponse> {
    const url = `${this.apiUrl}?page=${page}&limit=${limit}`;

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
        // MockAPI retorna 404 al sobrepasar la última página disponible
        if (error.status === 404) {
          return of({ incidencias: [], hasMore: false, page });
        }
        return throwError(() => error);
      })
    );
  }

  // Consulta total para los indicadores del Dashboard (R10)
  getAllIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl).pipe(
      map(items => (Array.isArray(items) ? items : [])),
      catchError(() => of([]))
    );
  }

  getIncidenciaById(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // R5: REGISTRO DE INCIDENCIAS EN LA API
  // ==========================================

  createIncidencia(incidencia: Incidencia): Observable<Incidencia> {
    if (!incidencia.codigo) {
      const suffix = Math.floor(100 + Math.random() * 900);
      incidencia.codigo = `INC-2026-${suffix}`;
    }
    if (!incidencia.fecha) {
      incidencia.fecha = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    if (!incidencia.estado) {
      incidencia.estado = 'pendiente';
    }

    return this.http.post<Incidencia>(this.apiUrl, incidencia).pipe(
      tap(() => this.updatesSubject.next())
    );
  }

  // ==========================================
  // R9: ACTUALIZACIÓN Y PERSISTENCIA REMOTA
  // ==========================================

  updateIncidencia(id: string, partial: Partial<Incidencia>): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.apiUrl}/${id}`, partial).pipe(
      tap(() => this.updatesSubject.next())
    );
  }

  // ==========================================
  // R1: CONSULTA DE SEGUIMIENTO LOCAL
  // ==========================================

  getSeguimientoIncidencias(): Observable<Incidencia[]> {
    const marked = this.storageService.markedCodes();
    if (!marked || marked.length === 0) {
      return of([]);
    }

    return this.http.get<Incidencia[]>(this.apiUrl).pipe(
      map(items => {
        const list = Array.isArray(items) ? items : [];
        const markedSet = new Set(marked.map(c => String(c).trim()));
        return list.filter(inc =>
          markedSet.has(String(inc.codigo || '').trim()) ||
          markedSet.has(String(inc.id || '').trim())
        );
      }),
      catchError(() => of([]))
    );
  }
}
