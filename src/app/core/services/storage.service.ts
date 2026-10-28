import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const SEGUIMIENTO_KEY = 'urbaninspect_seguimiento';
const BORRADOR_KEY = 'urbaninspect_borrador';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly markedCodes = signal<string[]>([]);

  constructor() {
    this.loadMarkedCodes();
  }

  async loadMarkedCodes(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: SEGUIMIENTO_KEY });
      const codes: string[] = value ? JSON.parse(value) : [];
      this.markedCodes.set(codes);
      return codes;
    } catch {
      this.markedCodes.set([]);
      return [];
    }
  }

  isMarked(codigo?: string, id?: string): boolean {
    const list = this.markedCodes();
    return (!!codigo && list.includes(codigo)) || (!!id && list.includes(id));
  }

  // R1: Guarda o retira el código en almacenamiento local
  async toggleMark(code: string): Promise<boolean> {
    if (!code) return false;
    const current = [...this.markedCodes()];
    const index = current.indexOf(code);
    let isMarked = false;

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(code);
      isMarked = true;
    }

    await Preferences.set({
      key: SEGUIMIENTO_KEY,
      value: JSON.stringify(current)
    });
    this.markedCodes.set(current);
    return isMarked;
  }

  // R8: Gestión de borrador de incidencia incompleta
  async saveDraft(data: unknown): Promise<void> {
    if (!data) {
      await this.clearDraft();
      return;
    }
    await Preferences.set({
      key: BORRADOR_KEY,
      value: JSON.stringify(data)
    });
  }

  async getDraft<T>(): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key: BORRADOR_KEY });
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    await Preferences.remove({ key: BORRADOR_KEY });
  }
}
