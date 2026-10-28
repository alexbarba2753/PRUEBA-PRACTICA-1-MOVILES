import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Coordenadas } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  /**
   * R7: Captura de coordenadas geográficas.
   * 1. Verifica y solicita permisos nativos en Android.
   * 2. Intenta obtener ubicación GPS física de alta precisión.
   * 3. Si no hay señal o está en PC/emulador, recurre a geolocalización por red/IP o navegador.
   */
  async getCurrentPosition(): Promise<Coordenadas> {
    // 1. Manejo de permisos en Capacitor nativo
    if (Capacitor.isNativePlatform()) {
      try {
        const check = await Geolocation.checkPermissions();
        if (check.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error('PERMISO_DENEGADO');
          }
        }
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('denied') || msg.includes('permission') || err?.message === 'PERMISO_DENEGADO') {
          throw new Error('PERMISO_DENEGADO');
        }
      }
    }

    // 2. Intentar con Capacitor Geolocation (físico / navegador)
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000
      });

      if (position?.coords) {
        return {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        };
      }
    } catch (capErr: any) {
      const msg = capErr?.message?.toLowerCase() || '';
      if (msg.includes('denied') || msg.includes('permission')) {
        throw new Error('PERMISO_DENEGADO');
      }
      // Continuar a fallbacks si fue timeout o error de sensor
    }

    // 3. Fallback con navigator.geolocation del navegador web
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const webCoords = await this.getWebCoords();
        return webCoords;
      } catch (webErr: any) {
        if (webErr?.code === 1) {
          throw new Error('PERMISO_DENEGADO');
        }
      }
    }

    // 4. Fallback por red / IP (Quito, Ecuador) para PCs y emuladores sin chip GPS
    try {
      const ipGeo = await firstValueFrom(
        this.http.get<any>('https://get.geojs.io/v1/ip/geo.json').pipe(timeout(3500))
      );
      if (ipGeo?.latitude && ipGeo?.longitude) {
        return {
          lat: Number(Number(ipGeo.latitude).toFixed(6)),
          lng: Number(Number(ipGeo.longitude).toFixed(6))
        };
      }
    } catch {
      // Si la consulta IP falla, se aplican coordenadas céntricas de Quito
    }

    // 5. Coordenadas predeterminadas del Distrito Metropolitano de Quito
    return {
      lat: -0.1807,
      lng: -78.4678
    };
  }

  private getWebCoords(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
        },
        err => reject(err),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    });
  }
}
