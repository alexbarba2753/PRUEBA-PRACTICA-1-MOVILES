import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  /**
   * R6: Captura de fotografía con Capacitor Camera.
   * Retorna DataUrl (Base64) comprimida para asegurar compatibilidad con MockAPI.
   */
  async capturePhoto(source: CameraSource = CameraSource.Prompt): Promise<string | null> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 45,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
        width: 480,
        correctOrientation: true
      });

      if (image?.dataUrl) {
        return await this.compressDataUrl(image.dataUrl, 420, 0.5);
      }
      return null;
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('cancel') || msg.includes('user cancelled') || msg.includes('dismissed')) {
        return null; // El usuario canceló la toma de foto; los demás campos permanecen intactos (R6)
      }
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('denegado')) {
        throw new Error('PERMISO_DENEGADO');
      }
      throw new Error(error?.message || 'Error al capturar imagen');
    }
  }

  // Comprime la imagen en memoria usando un canvas HTML5 para evitar error HTTP 413 de MockAPI
  private compressDataUrl(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
}
