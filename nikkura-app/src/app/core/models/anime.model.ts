export interface AnimeImages {
  jpg: {
    image_url: string;
    large_image_url: string;
  };
}

export interface AnimeGenre {
  mal_id: number;
  name: string;
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: AnimeImages;
  synopsis: string | null;
  score: number | null;
  scored_by: number | null;
  episodes: number | null;
  status: string;
  genres: AnimeGenre[];
  year: number | null;
  type: string | null;
  trailer?: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    has_next_page: boolean;
    current_page: number;
    last_visible_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}
