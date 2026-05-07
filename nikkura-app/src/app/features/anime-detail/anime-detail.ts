import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimeService } from '../../core/services/anime.service';
import { CollectionService } from '../../core/services/collection.service';
import { AuthService } from '../../core/services/auth.service';
import { Anime } from '../../core/models/anime.model';
import { Folder, WatchStatus } from '../../core/models/folder.model';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-anime-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, StarRatingComponent, NavbarComponent],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.scss',
})
export class AnimeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly animeService = inject(AnimeService);
  private readonly collectionService = inject(CollectionService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly fb = inject(FormBuilder);

  protected anime = signal<Anime | null>(null);
  protected isLoading = signal(true);
  protected folders = signal<Folder[]>([]);
  protected showAddModal = signal(false);
  protected isSaving = signal(false);
  protected saveSuccess = signal(false);

  protected addForm = this.fb.group({
    folderId: [''],
    status: ['pending' as WatchStatus],
    score: [null as number | null],
    note: [''],
  });

  ngOnInit(): void {
    const malId = Number(this.route.snapshot.paramMap.get('id'));
    this.animeService.getAnimeById(malId).subscribe({
      next: (res) => {
        this.anime.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.collectionService.getUserFolders().subscribe((folders) => {
      this.folders.set(folders);
      if (folders.length) this.addForm.patchValue({ folderId: folders[0].id });
    });
  }

  protected openAddModal(): void {
    this.showAddModal.set(true);
  }

  protected closeAddModal(): void {
    this.showAddModal.set(false);
  }

  protected onScoreChange(score: number): void {
    this.addForm.patchValue({ score });
  }

  protected async saveToCollection(): Promise<void> {
    const anime = this.anime();
    const v = this.addForm.value;
    if (!anime || !v.folderId) return;

    this.isSaving.set(true);
    try {
      await this.collectionService.addToFolder(v.folderId, {
        malId: anime.mal_id,
        title: anime.title_english || anime.title,
        imageUrl: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
        score: v.score ?? null,
        note: v.note ?? '',
        status: (v.status as WatchStatus) ?? 'pending',
      });
      this.saveSuccess.set(true);
      this.showAddModal.set(false);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } finally {
      this.isSaving.set(false);
    }
  }

  protected get embedUrl(): SafeResourceUrl | null {
    const url = this.anime()?.trailer?.embed_url;
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
