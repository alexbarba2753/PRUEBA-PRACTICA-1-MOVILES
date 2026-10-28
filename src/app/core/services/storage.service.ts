import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

const SEGUIMIENTO_KEY = 'urbaninspect_seguimiento_codigos';
const BORRADOR_KEY = 'urbaninspect_borrador_registro';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private markedCodesSubject = new BehaviorSubject<string[]>([]);
  public markedCodes$: Observable<string[]> = this.markedCodesSubject.asObservable();

  constructor() {
    this.loadMarkedCodes();
  }

  // ==========================================
  // R1: SEGUIMIENTO LOCAL DE INCIDENCIAS
  // ==========================================

  private async loadMarkedCodes(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: SEGUIMIENTO_KEY });
      if (value) {
        const codes: string[] = JSON.parse(value);
        this.markedCodesSubject.next(codes);
      } else {
        this.markedCodesSubject.next([]);
      }
    } catch {
      this.markedCodesSubject.next([]);
    }
  }

  async getMarkedCodes(): Promise<string[]> {
    const { value } = await Preferences.get({ key: SEGUIMIENTO_KEY });
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  async isMarked(codigo: string): Promise<boolean> {
    const codes = await this.getMarkedCodes();
    return codes.includes(codigo);
  }

  async toggleMark(codigo: string): Promise<boolean> {
    const codes = await this.getMarkedCodes();
    const index = codes.indexOf(codigo);
    let isNowMarked = false;

    if (index > -1) {
      codes.splice(index, 1);
      isNowMarked = false;
    } else {
      codes.push(codigo);
      isNowMarked = true;
    }

    await Preferences.set({
      key: SEGUIMIENTO_KEY,
      value: JSON.stringify(codes)
    });

    this.markedCodesSubject.next([...codes]);
    return isNowMarked;
  }

  async unmark(codigo: string): Promise<void> {
    const codes = await this.getMarkedCodes();
    const filtered = codes.filter(c => c !== codigo);
    await Preferences.set({
      key: SEGUIMIENTO_KEY,
      value: JSON.stringify(filtered)
    });
    this.markedCodesSubject.next(filtered);
  }

  // ==========================================
  // R8: RECUPERACIÓN DE BORRADOR INCOMPLETO
  // ==========================================

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
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    await Preferences.remove({ key: BORRADOR_KEY });
  }
}
