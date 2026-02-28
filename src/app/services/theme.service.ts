import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark = signal<boolean>(localStorage.getItem('theme') === 'dark');

  readonly isDark = this._isDark.asReadonly();
  readonly theme = computed(() => (this._isDark() ? 'dark' : 'light'));

  constructor() {
    effect(() => {
      const dark = this._isDark();
      document.body.classList.toggle('dark-theme', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this._isDark.update((v) => !v);
  }

  setDark(dark: boolean): void {
    this._isDark.set(dark);
  }
}
