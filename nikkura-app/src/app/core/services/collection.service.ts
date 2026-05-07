import { Injectable, inject } from '@angular/core';
import { collectionData } from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AnimeEntry, Folder } from '../models/folder.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly authService = inject(AuthService);

  private get db() { return getFirestore(); }

  private get uid(): string {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  getUserFolders(): Observable<Folder[]> {
    const ref = collection(this.db, `users/${this.uid}/folders`);
    return collectionData(ref, { idField: 'id' }) as Observable<Folder[]>;
  }

  getFolderEntries(folderId: string): Observable<AnimeEntry[]> {
    const ref = collection(this.db, `users/${this.uid}/folders/${folderId}/entries`);
    return collectionData(ref, { idField: 'malId' }) as Observable<AnimeEntry[]>;
  }

  async createFolder(name: string, emoji: string): Promise<string> {
    const ref = collection(this.db, `users/${this.uid}/folders`);
    const docRef = await addDoc(ref, { name, emoji, createdAt: serverTimestamp() });
    return docRef.id;
  }

  async deleteFolder(folderId: string): Promise<void> {
    await deleteDoc(doc(this.db, `users/${this.uid}/folders/${folderId}`));
  }

  async addToFolder(folderId: string, entry: Omit<AnimeEntry, 'addedAt'>): Promise<void> {
    const ref = doc(this.db, `users/${this.uid}/folders/${folderId}/entries/${entry.malId}`);
    await setDoc(ref, { ...entry, addedAt: serverTimestamp() });
  }

  async removeFromFolder(folderId: string, malId: number): Promise<void> {
    await deleteDoc(doc(this.db, `users/${this.uid}/folders/${folderId}/entries/${malId}`));
  }

  async updateAnimeEntry(
    folderId: string,
    malId: number,
    updates: Partial<Pick<AnimeEntry, 'score' | 'note' | 'status'>>,
  ): Promise<void> {
    await updateDoc(doc(this.db, `users/${this.uid}/folders/${folderId}/entries/${malId}`), updates);
  }
}
