import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incidencia, IncidenciasPaginadasResponse } from '../models/incidencia.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  private updatesSubject = new BehaviorSubject<void>(undefined);
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

  /**
   * Consulta remota paginada contra MockAPI (R2, R3).
   * Envía ?page=X&limit=Y. Al agotarse los registros (o recibir 404), hasMore pasa a false
   * para detener las peticiones del infinite scroll.
   */
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
        // MockAPI retorna 404 cuando se solicita una página posterior al último registro
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

  /**
   * Obtiene la totalidad de registros remotos para alimentar los indicadores del Dashboard (R10)
   */
  getAllIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl).pipe(
      map(items => Array.isArray(items) ? items : []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene una incidencia por su ID remoto (R2, R9)
   */
  getIncidenciaById(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // R5: REGISTRO DE INCIDENCIAS EN LA API
  // ==========================================

  createIncidencia(incidencia: Incidencia): Observable<Incidencia> {
    if (!incidencia.codigo) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      incidencia.codigo = `INC-2026-${randomSuffix}`;
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

  /**
   * R1: Obtiene las incidencias marcadas en el dispositivo.
   * La lista de códigos marcados se conserva únicamente en local y NO se envía a la API.
   */
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
