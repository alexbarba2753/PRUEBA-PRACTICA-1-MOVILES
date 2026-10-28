import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  /**
   * R6: Captura de fotografía o selección desde galería.
   * Devuelve la imagen como DataUrl (Base64) comprimida a menos de 30KB
   * para asegurar compatibilidad total con el límite de carga de MockAPI.
   */
  async capturePhoto(source: CameraSource = CameraSource.Prompt): Promise<string | null> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 45,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 500,
        correctOrientation: true
      });

      if (image && image.dataUrl) {
        return await this.compressDataUrl(image.dataUrl, 450, 0.5);
      }
      return null;
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('cancel') || msg.includes('user cancelled') || msg.includes('dismissed')) {
        return null;
      }

      if (msg.includes('permission') || msg.includes('denied') || msg.includes('denegado')) {
        throw new Error('PERMISO_DENEGADO');
      }

      throw new Error(error?.message || 'Error al capturar imagen');
    }
  }

  /**
   * Comprime una imagen en memoria mediante Canvas para garantizar que su peso
   * sea de aproximadamente 15KB a 25KB, evitando el error HTTP 413 (Payload Too Large) de MockAPI.
   */
  private compressDataUrl(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
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
