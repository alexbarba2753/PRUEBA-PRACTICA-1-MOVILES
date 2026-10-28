import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ClimaInfo } from '../models/incidencia.model';

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    precipitation?: number;
    weather_code?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  /**
   * R4: Consulta condiciones meteorológicas en tiempo real usando coordenadas reales.
   * Utiliza la API pública de Open-Meteo (independiente de la API de oficina, sin API key).
   */
  getClima(lat: number, lng: number): Observable<ClimaInfo> {
    const url = `${environment.weatherApiUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(res => {
        if (!res || !res.current) {
          throw new Error('Respuesta meteorológica vacía');
        }

        const temp = res.current.temperature_2m ?? 18;
        const precip = res.current.precipitation ?? 0;
        const code = res.current.weather_code ?? 0;
        const condicion = this.interpretarCodigoClima(code);
        const advertenciaLluvia = precip > 5.0;

        const info: ClimaInfo = {
          temperatura: Number(temp.toFixed(1)),
          precipitacion: Number(precip.toFixed(1)),
          condicion,
          advertenciaLluvia
        };

        return info;
      }),
      catchError(err => {
        return throwError(() => new Error('No se pudo conectar al servicio meteorológico. Compruebe su conexión.'));
      })
    );
  }

  private interpretarCodigoClima(code: number): string {
    if (code === 0) return 'Cielo despejado';
    if (code === 1) return 'Principalmente despejado';
    if (code === 2) return 'Parcialmente nublado';
    if (code === 3) return 'Cielo cubierto';
    if (code === 45 || code === 48) return 'Niebla o neblina';
    if (code >= 51 && code <= 55) return 'Llovizna leve a moderada';
    if (code >= 61 && code <= 63) return 'Lluvia ligera o moderada';
    if (code >= 65) return 'Lluvia intensa';
    if (code >= 71 && code <= 77) return 'Nieve o granizo';
    if (code >= 80 && code <= 82) return 'Chubascos de lluvia';
    if (code >= 95) return 'Tormenta eléctrica';
    return 'Condiciones variables';
  }
}
