import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Coordenadas } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  /**
   * R7: Captura de coordenadas geográficas vía GPS nativo de Capacitor.
   */
  async getCurrentPosition(): Promise<Coordenadas> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 6000
      });

      return {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6))
      };
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('denegado')) {
        throw new Error('PERMISO_DENEGADO');
      }
      throw new Error('GPS_NO_DISPONIBLE');
    }
  }
}
