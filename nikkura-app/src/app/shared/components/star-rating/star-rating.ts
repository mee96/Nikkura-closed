import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRatingComponent {
  score = input<number | null>(null);
  readonly = input(false);
  scoreChange = output<number>();

  protected hovered = signal<number | null>(null);
  protected stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  protected onHover(star: number): void {
    if (!this.readonly()) this.hovered.set(star);
  }

  protected onLeave(): void {
    this.hovered.set(null);
  }

  protected onSelect(star: number): void {
    if (!this.readonly()) this.scoreChange.emit(star);
  }

  protected isActive(star: number): boolean {
    const active = this.hovered() ?? this.score();
    return active !== null && star <= active;
  }
}
