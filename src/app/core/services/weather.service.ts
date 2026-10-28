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
   * R4: Consulta condiciones meteorológicas en tiempo real usando coordenadas geográficas.
   * Utiliza la API pública Open-Meteo (independiente de la API de oficina, sin API key).
   */
  getClima(lat: number, lng: number): Observable<ClimaInfo> {
    const url = `${environment.weatherApiUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(res => {
        if (!res?.current) {
          throw new Error('Respuesta meteorológica vacía');
        }

        const temp = res.current.temperature_2m ?? 18;
        const precip = res.current.precipitation ?? 0;
        const code = res.current.weather_code ?? 0;

        return {
          temperatura: Number(temp.toFixed(1)),
          precipitacion: Number(precip.toFixed(1)),
          condicion: this.interpretarCodigoClima(code),
          advertenciaLluvia: precip > 5.0 // R4: Advertencia si precipitación supera 5 mm
        };
      }),
      catchError(() =>
        throwError(() => new Error('El servicio meteorológico no respondió. Puede continuar con el registro.'))
      )
    );
  }

  private interpretarCodigoClima(code: number): string {
    if (code === 0) return 'Cielo despejado';
    if (code <= 3) return 'Parcialmente nublado';
    if (code <= 48) return 'Niebla o neblina';
    if (code <= 55) return 'Llovizna';
    if (code <= 65) return 'Lluvia';
    if (code <= 77) return 'Nieve o granizo';
    if (code <= 82) return 'Chubascos';
    if (code >= 95) return 'Tormenta eléctrica';
    return 'Condiciones variables';
  }
}
