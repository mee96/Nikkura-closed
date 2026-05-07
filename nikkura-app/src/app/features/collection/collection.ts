import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CollectionService } from '../../core/services/collection.service';
import { ToastService } from '../../core/services/toast.service';
import { Folder, AnimeEntry } from '../../core/models/folder.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating';

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent, StarRatingComponent],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class CollectionComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected folders = signal<Folder[]>([]);
  protected activeFolder = signal<Folder | null>(null);
  protected entries = signal<AnimeEntry[]>([]);
  protected showNewFolderForm = signal(false);
  protected isSaving = signal(false);
  protected pendingDeleteFolderId = signal<string | null>(null);

  protected newFolderForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    emoji: ['📁'],
  });

  ngOnInit(): void {
    this.collectionService.getUserFolders().subscribe((folders) => {
      this.folders.set(folders);
    });
  }

  protected openFolder(folder: Folder): void {
    this.activeFolder.set(folder);
    this.pendingDeleteFolderId.set(null);
    this.collectionService.getFolderEntries(folder.id).subscribe((entries) => {
      this.entries.set(entries);
    });
  }

  protected closeFolder(): void {
    this.activeFolder.set(null);
    this.entries.set([]);
  }

  protected async createFolder(): Promise<void> {
    if (this.newFolderForm.invalid) return;
    this.isSaving.set(true);
    const { name, emoji } = this.newFolderForm.value;
    try {
      await this.collectionService.createFolder(name!, emoji!);
      this.newFolderForm.reset({ name: '', emoji: '📁' });
      this.showNewFolderForm.set(false);
      this.toastService.success(`Carpeta "${name}" creada`);
    } catch {
      this.toastService.error('No se pudo crear la carpeta');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected requestDeleteFolder(folderId: string, event: Event): void {
    event.stopPropagation();
    this.pendingDeleteFolderId.set(folderId);
  }

  protected cancelDelete(event: Event): void {
    event.stopPropagation();
    this.pendingDeleteFolderId.set(null);
  }

  protected async confirmDeleteFolder(folder: Folder, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.collectionService.deleteFolder(folder.id);
      this.toastService.success(`Carpeta "${folder.name}" eliminada`);
      if (this.activeFolder()?.id === folder.id) this.closeFolder();
    } catch {
      this.toastService.error('No se pudo eliminar la carpeta');
    } finally {
      this.pendingDeleteFolderId.set(null);
    }
  }

  protected async removeEntry(entry: AnimeEntry): Promise<void> {
    const folder = this.activeFolder();
    if (!folder) return;
    try {
      await this.collectionService.removeFromFolder(folder.id, entry.malId);
      this.entries.update((list) => list.filter((e) => e.malId !== entry.malId));
      this.toastService.success(`"${entry.title}" eliminado de la carpeta`);
    } catch {
      this.toastService.error('No se pudo eliminar el anime');
    }
  }

  protected async updateScore(entry: AnimeEntry, score: number): Promise<void> {
    const folder = this.activeFolder();
    if (!folder) return;
    await this.collectionService.updateAnimeEntry(folder.id, entry.malId, { score });
    this.entries.update((list) =>
      list.map((e) => (e.malId === entry.malId ? { ...e, score } : e)),
    );
  }

  protected readonly STATUS_LABELS: Record<string, string> = {
    watching: 'Viendo',
    completed: 'Completado',
    pending: 'Pendiente',
    dropped: 'Abandonado',
  };
}
