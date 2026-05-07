import { Timestamp } from 'firebase/firestore';

export interface Folder {
  id: string;
  name: string;
  emoji: string;
  createdAt: Timestamp;
}

export type WatchStatus = 'watching' | 'completed' | 'pending' | 'dropped';

export interface AnimeEntry {
  malId: number;
  title: string;
  imageUrl: string;
  score: number | null;
  note: string;
  addedAt: Timestamp;
  status: WatchStatus;
}
