import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CollectionService } from '../../core/services/collection.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { UserRole } from '../../core/models/user.model';
import { forkJoin, take } from 'rxjs';
import { AnimeEntry } from '../../core/models/folder.model';

const ROLE_INFO: Record<string, { label: string; icon: string; description: string }> = {
  moe: { label: 'Moe Magical', icon: '🌸', description: 'Shoujo, Romance, Magia pastel' },
  haku: { label: 'Hakusama', icon: '⚡', description: 'Shounen, Acción, Aventura' },
  sen: { label: 'Senpai', icon: '🍃', description: 'Seinen, Psicológico, Maduro' },
};

const ROLES: UserRole[] = ['moe', 'haku', 'sen'];

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);

  protected readonly user = this.authService.currentUser;
  protected readonly roleInfo = computed(() => {
    const role = this.user()?.role ?? 'moe';
    return ROLE_INFO[role] ?? ROLE_INFO['moe'];
  });
  protected readonly roles = ROLES;
  protected readonly allRoleInfo = ROLE_INFO;

  protected totalFolders = signal(0);
  protected totalAnimes = signal(0);
  protected averageScore = signal<number | null>(null);
  protected completedCount = signal(0);
  protected showRoleSelector = signal(false);
  protected isSavingRole = signal(false);

  ngOnInit(): void {
    this.collectionService.getUserFolders().pipe(take(1)).subscribe((folders) => {
      this.totalFolders.set(folders.length);
      if (!folders.length) return;

      const entryStreams = folders.map((f) =>
        this.collectionService.getFolderEntries(f.id).pipe(take(1)),
      );

      forkJoin(entryStreams).subscribe((allEntries) => {
        const flat: AnimeEntry[] = allEntries.flat();
        this.totalAnimes.set(flat.length);
        this.completedCount.set(flat.filter((e) => e.status === 'completed').length);

        const scored = flat.filter((e) => e.score !== null);
        if (scored.length) {
          const avg = scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length;
          this.averageScore.set(Math.round(avg * 10) / 10);
        }
      });
    });
  }

  protected async changeRole(role: UserRole): Promise<void> {
    if (role === this.user()?.role) {
      this.showRoleSelector.set(false);
      return;
    }
    this.isSavingRole.set(true);
    try {
      await this.authService.updateRole(role);
      this.toastService.success(`Rol cambiado a ${ROLE_INFO[role].label} ${ROLE_INFO[role].icon}`);
      this.showRoleSelector.set(false);
    } catch {
      this.toastService.error('No se pudo cambiar el rol');
    } finally {
      this.isSavingRole.set(false);
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
