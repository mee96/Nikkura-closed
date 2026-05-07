import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anime } from '../../../core/models/anime.model';

@Component({
  selector: 'app-anime-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './anime-card.html',
  styleUrl: './anime-card.scss',
})
export class AnimeCardComponent {
  anime = input.required<Anime>();

  protected get imageUrl(): string {
    const a = this.anime();
    return a.images.jpg.large_image_url || a.images.jpg.image_url;
  }
}
