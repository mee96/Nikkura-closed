import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AnimeService } from '../../core/services/anime.service';
import { AuthService } from '../../core/services/auth.service';
import { Anime } from '../../core/models/anime.model';
import { AnimeCardComponent } from '../../shared/components/anime-card/anime-card';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

const ROLE_LABELS: Record<string, { title: string; subtitle: string }> = {
  moe: { title: '🌸 Para ti, Magical', subtitle: 'Romance, magia y corazones rotos' },
  haku: { title: '⚡ Para ti, Hakusama', subtitle: 'Acción, aventura y poder sin límites' },
  sen: { title: '🍃 Para ti, Senpai', subtitle: 'Psicología, madurez y profundidad' },
};

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimeCardComponent, NavbarComponent, InfiniteScrollDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly animeService = inject(AnimeService);
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.currentUser;
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role ?? 'moe';
    return ROLE_LABELS[role] ?? ROLE_LABELS['moe'];
  });

  protected recommended = signal<Anime[]>([]);
  protected topAiring = signal<Anime[]>([]);
  protected isLoadingRecommended = signal(true);
  protected isLoadingTop = signal(true);
  protected hasMoreRecommended = signal(false);
  protected hasMoreTop = signal(false);

  private recommendedPage = 1;
  private topPage = 1;
  private role = 'moe';

  ngOnInit(): void {
    this.role = this.user()?.role ?? 'moe';
    this.loadRecommended();
    this.loadTop();
  }

  private loadRecommended(): void {
    this.isLoadingRecommended.set(true);
    this.animeService.getRecommendedByRole(this.role, this.recommendedPage).subscribe({
      next: (res) => {
        this.recommended.update((prev) => [...prev, ...res.data]);
        this.hasMoreRecommended.set(res.pagination?.has_next_page ?? false);
        this.isLoadingRecommended.set(false);
      },
      error: () => this.isLoadingRecommended.set(false),
    });
  }

  private loadTop(): void {
    this.isLoadingTop.set(true);
    this.animeService.getTopAiring(this.topPage).subscribe({
      next: (res) => {
        this.topAiring.update((prev) => [...prev, ...res.data]);
        this.hasMoreTop.set(res.pagination?.has_next_page ?? false);
        this.isLoadingTop.set(false);
      },
      error: () => this.isLoadingTop.set(false),
    });
  }

  protected onScrollRecommended(): void {
    if (this.isLoadingRecommended() || !this.hasMoreRecommended()) return;
    this.recommendedPage++;
    this.loadRecommended();
  }

  protected onScrollTop(): void {
    if (this.isLoadingTop() || !this.hasMoreTop()) return;
    this.topPage++;
    this.loadTop();
  }
}
