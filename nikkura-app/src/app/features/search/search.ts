import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AnimeService } from '../../core/services/anime.service';
import { Anime } from '../../core/models/anime.model';
import { AnimeCardComponent } from '../../shared/components/anime-card/anime-card';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

const GENRES = [
  { id: 1, name: 'Acción' },
  { id: 2, name: 'Aventura' },
  { id: 8, name: 'Drama' },
  { id: 9, name: 'Ecchi' },
  { id: 10, name: 'Fantasía' },
  { id: 14, name: 'Horror' },
  { id: 16, name: 'Mahou Shoujo' },
  { id: 22, name: 'Romance' },
  { id: 25, name: 'Shoujo' },
  { id: 27, name: 'Shounen' },
  { id: 36, name: 'Slice of Life' },
  { id: 40, name: 'Psicológico' },
  { id: 42, name: 'Seinen' },
];

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AnimeCardComponent, NavbarComponent, InfiniteScrollDirective],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent implements OnDestroy {
  private readonly animeService = inject(AnimeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  protected readonly genres = GENRES;
  protected results = signal<Anime[]>([]);
  protected isLoading = signal(false);
  protected hasSearched = signal(false);
  protected currentPage = signal(1);
  protected hasNextPage = signal(false);

  protected readonly currentYear = 2026;
  protected readonly years = Array.from({ length: 35 }, (_, i) => this.currentYear - i);

  protected filters = this.fb.group({
    query: [''],
    genreId: [null as number | null],
    type: [''],
    status: [''],
    minScore: [null as number | null],
    year: [null as number | null],
  });

  constructor() {
    this.filters.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.doSearch(1));
  }

  protected doSearch(page = 1): void {
    const v = this.filters.value;
    if (!v.query && !v.genreId) {
      this.results.set([]);
      this.hasSearched.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.currentPage.set(page);

    this.animeService
      .searchAnime({
        query: v.query || undefined,
        genreIds: v.genreId ? [v.genreId] : undefined,
        type: v.type || undefined,
        status: v.status || undefined,
        minScore: v.minScore ?? undefined,
        year: v.year ?? undefined,
        page,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.results.set(page === 1 ? res.data : [...this.results(), ...res.data]);
          this.hasNextPage.set(res.pagination?.has_next_page ?? false);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  protected loadMore(): void {
    this.doSearch(this.currentPage() + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
