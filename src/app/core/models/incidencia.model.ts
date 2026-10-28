export type TipoIncidencia =
  | 'Bache'
  | 'Luminaria dañada'
  | 'Señalización deteriorada'
  | 'Alcantarilla obstruida'
  | 'Daño en parque';

export type EstadoIncidencia = 'pendiente' | 'en_proceso' | 'resuelta';

export type PrioridadIncidencia = 'baja' | 'media' | 'alta';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface ClimaInfo {
  temperatura: number;       // °C
  precipitacion: number;     // mm en la última hora
  condicion: string;         // Descripción textual
  advertenciaLluvia?: boolean; // True si precipitacion > 5 mm
}

export interface Incidencia {
  // Los 8 campos previstos obligatorios según R2:
  id?: string;
  codigo: string;            // Código visible (ej: INC-2026-001)
  tipo: TipoIncidencia | string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;             // ISO 8601 o fecha legible
  estado: EstadoIncidencia;  // pendiente | en_proceso | resuelta
  fotografia?: string;       // URL remota o Base64 Data URL

  // Campos complementarios requeridos para R4, R5, R7 y R9:
  prioridad: PrioridadIncidencia;
  coordenadas?: Coordenadas;
  clima?: ClimaInfo;
  observacion?: string;      // Obligatoria para estado 'resuelta' (R9)
  createdAt?: string;
}

export interface IncidenciasPaginadasResponse {
  incidencias: Incidencia[];
  hasMore: boolean;
  page: number;
  total?: number;
}
