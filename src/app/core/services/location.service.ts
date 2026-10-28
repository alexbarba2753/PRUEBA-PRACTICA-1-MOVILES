import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Coordenadas } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  /**
   * R7: Captura de coordenadas geográficas vía GPS nativo o navegador.
   * Utiliza precisión estándar para evitar timeouts en computadoras y emuladores.
   */
  async getCurrentPosition(): Promise<Coordenadas> {
    try {
      // 1. Intentar con Capacitor Geolocation
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false, // Mucho más rápido y compatible en PC/navegadores
        timeout: 6000
      });

      return {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6))
      };
    } catch (capError: any) {
      // 2. Fallback a navigator.geolocation si está en navegador web
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const webCoords = await this.getWebCoords();
          return webCoords;
        } catch {
          // Si ambos fallan, evaluamos si fue permiso denegado
        }
      }

      const msg = capError?.message?.toLowerCase() || '';
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('denegado')) {
        throw new Error('PERMISO_DENEGADO');
      }

      throw new Error(capError?.message || 'Señal GPS no disponible');
    }
  }

  private getWebCoords(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    });
  }
}
