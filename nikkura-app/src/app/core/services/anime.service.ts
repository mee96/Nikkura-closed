import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Anime, JikanResponse } from '../models/anime.model';

export interface AnimeSearchFilters {
  query?: string;
  genreIds?: number[];
  type?: string;
  status?: string;
  minScore?: number;
  year?: number;
  page?: number;
}

const ROLE_GENRE_IDS: Record<string, number[]> = {
  moe: [25, 22, 36, 16, 8],   // Shoujo, Romance, Slice of Life, Mahou Shoujo, Drama
  haku: [27, 1, 2, 31, 10],   // Shounen, Action, Adventure, Super Power, Fantasy
  sen: [42, 9, 40, 58, 7],    // Seinen, Ecchi, Psychological, Gore (Horror), Mystery
};

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.jikan.moe/v4';

  getTopAiring(page = 1): Observable<JikanResponse<Anime[]>> {
    const params = new HttpParams()
      .set('filter', 'airing')
      .set('page', page)
      .set('limit', 20);
    return this.http.get<JikanResponse<Anime[]>>(`${this.baseUrl}/top/anime`, { params });
  }

  getRecommendedByRole(role: string, page = 1): Observable<JikanResponse<Anime[]>> {
    const genreIds = ROLE_GENRE_IDS[role] ?? ROLE_GENRE_IDS['moe'];
    const genres = genreIds.slice(0, 3).join(',');
    const params = new HttpParams()
      .set('genres', genres)
      .set('order_by', 'score')
      .set('sort', 'desc')
      .set('page', page)
      .set('limit', 20);
    return this.http.get<JikanResponse<Anime[]>>(`${this.baseUrl}/anime`, { params });
  }

  searchAnime(filters: AnimeSearchFilters): Observable<JikanResponse<Anime[]>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('limit', 20);
    if (filters.query) params = params.set('q', filters.query);
    if (filters.genreIds?.length) params = params.set('genres', filters.genreIds.join(','));
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.minScore) params = params.set('min_score', filters.minScore);
    if (filters.year) params = params.set('start_date', `${filters.year}-01-01`);
    return this.http.get<JikanResponse<Anime[]>>(`${this.baseUrl}/anime`, { params });
  }

  getAnimeById(malId: number): Observable<JikanResponse<Anime>> {
    return this.http.get<JikanResponse<Anime>>(`${this.baseUrl}/anime/${malId}`);
  }

  getGenreIdsForRole(role: string): number[] {
    return ROLE_GENRE_IDS[role] ?? ROLE_GENRE_IDS['moe'];
  }
}
