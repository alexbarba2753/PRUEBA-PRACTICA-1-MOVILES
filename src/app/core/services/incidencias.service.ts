import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, Subject, from } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incidencia, IncidenciasPaginadasResponse } from '../models/incidencia.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
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
   * y sincroniza los códigos de seguimiento para purgar incidencias eliminadas.
   */
  getAllIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl).pipe(
      map(items => Array.isArray(items) ? items : []),
      tap(list => {
        this.syncMarkedCodesWithRemote(list);
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Compara los códigos de seguimiento guardados en el dispositivo con las incidencias remotas.
   * Si una incidencia fue eliminada de la oficina remota, se purga del almacenamiento local
   * para mantener sincronizados los contadores del Dashboard y la pestaña de Seguimiento.
   */
  async syncMarkedCodesWithRemote(remoteList: Incidencia[]): Promise<string[]> {
    try {
      const codes = await this.storageService.getMarkedCodes();
      if (!codes || codes.length === 0) return [];

      const existingKeys = new Set(
        remoteList.flatMap(inc => [
          String(inc.codigo || '').trim(),
          String(inc.id || '').trim()
        ]).filter(k => k.length > 0)
      );

      const validCodes = codes.filter(c => existingKeys.has(String(c).trim()));
      if (validCodes.length !== codes.length) {
        await this.storageService.setMarkedCodes(validCodes);
      }
      return validCodes;
    } catch {
      return [];
    }
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
   * Si algún registro fue eliminado remotamente de la oficina, se purga automáticamente de las preferencias locales.
   */
  getSeguimientoIncidencias(): Observable<Incidencia[]> {
    return from(this.storageService.getMarkedCodes()).pipe(
      switchMap(codes => {
        if (!codes || codes.length === 0) {
          return of([]);
        }
        return this.http.get<Incidencia[]>(this.apiUrl).pipe(
          map(items => {
            const list = Array.isArray(items) ? items : [];
            const existingKeys = new Set(
              list.flatMap(inc => [
                String(inc.codigo || '').trim(),
                String(inc.id || '').trim()
              ]).filter(k => k.length > 0)
            );

            // Filtrar códigos válidos que aún existen en MockAPI
            const validCodes = codes.filter(c => existingKeys.has(String(c).trim()));
            if (validCodes.length !== codes.length) {
              this.storageService.setMarkedCodes(validCodes);
            }

            const validSet = new Set(validCodes.map(c => String(c).trim()));
            return list.filter(inc =>
              validSet.has(String(inc.codigo || '').trim()) ||
              validSet.has(String(inc.id || '').trim())
            );
          }),
          catchError(() => of([]))
        );
      })
    );
  }
}
