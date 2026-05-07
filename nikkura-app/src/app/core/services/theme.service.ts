import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentTheme = signal<UserRole>('moe');

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.body.className = `theme-${this.currentTheme()}`;
      }
    });
  }

  setTheme(role: UserRole): void {
    this.currentTheme.set(role);
  }
}
