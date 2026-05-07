import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isLoading()) {
      <div class="app-loading" role="status" aria-label="Cargando Nikkura">
        <div class="loading-spinner"></div>
      </div>
    } @else {
      <router-outlet />
      <app-toast />
    }
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
}
