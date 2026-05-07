import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserRole } from '../../../core/models/user.model';

interface RoleOption {
  id: UserRole;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  genres: string[];
  font: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  readonly step = signal<1 | 2>(1);
  readonly selectedRole = signal<UserRole | null>(null);
  readonly hoveredRole = signal<UserRole | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly canProceed = computed(() => this.selectedRole() !== null);

  readonly roles: RoleOption[] = [
    {
      id: 'moe',
      name: 'Moe Magical',
      emoji: '🌸',
      tagline: 'Dulce & Mágico',
      description: 'Shoujo, romance y magia pastel. Tu mundo es color de rosa.',
      genres: ['Shoujo', 'Romance', 'Slice of Life', 'Mahou Shoujo'],
      font: "'Quicksand', sans-serif",
    },
    {
      id: 'haku',
      name: 'Hakusama',
      emoji: '⚡',
      tagline: 'Intenso & Eléctrico',
      description: 'Acción explosiva, héroes épicos y batallas legendarias.',
      genres: ['Shounen', 'Acción', 'Aventura', 'Mecha'],
      font: "'Rajdhani', sans-serif",
    },
    {
      id: 'sen',
      name: 'Senpai',
      emoji: '🍃',
      tagline: 'Maduro & Profundo',
      description: 'Psicología, oscuridad y narrativas que te hacen pensar.',
      genres: ['Seinen', 'Psicológico', 'Gore', 'Fantasy adulto'],
      font: "'Playfair Display', serif",
    },
  ];

  onRoleHover(role: UserRole | null): void {
    this.hoveredRole.set(role);
    if (role) {
      this.themeService.setTheme(role);
    } else if (this.selectedRole()) {
      this.themeService.setTheme(this.selectedRole()!);
    } else {
      this.themeService.setTheme('moe');
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.themeService.setTheme(role);
  }

  goToStep2(): void {
    if (!this.selectedRole()) return;
    this.step.set(2);
  }

  goBack(): void {
    this.step.set(1);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.selectedRole()) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { displayName, email, password } = this.form.value;

    try {
      await this.authService.register(
        email!,
        password!,
        displayName!,
        this.selectedRole()!,
      );
    } catch (err: unknown) {
      this.error.set(this.authService.getErrorMessage(err));
      this.isLoading.set(false);
    }
  }

  getRoleById(id: UserRole): RoleOption {
    return this.roles.find((r) => r.id === id)!;
  }
}
