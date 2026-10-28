import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  /**
   * R6: Captura de fotografía o selección desde galería.
   * Devuelve la imagen como DataUrl (Base64) para que sea accesible de manera
   * permanente en la API sin depender de rutas temporales del dispositivo.
   * Si el usuario cancela, devuelve null sin alterar los datos del formulario.
   */
  async capturePhoto(source: CameraSource = CameraSource.Prompt): Promise<string | null> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 65, // Buena calidad pero peso ligero para la API
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 1024,
        correctOrientation: true
      });

      if (image && image.dataUrl) {
        return image.dataUrl;
      }
      return null;
    } catch (error: any) {
      // Si el usuario simplemente canceló la captura, no es un error que deba alertar
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('cancel') || msg.includes('user cancelled') || msg.includes('dismissed')) {
        return null;
      }

      // Si los permisos fueron denegados
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('denegado')) {
        throw new Error('PERMISO_DENEGADO');
      }

      // Otro error
      throw new Error(error?.message || 'Error al capturar imagen');
    }
  }
}
