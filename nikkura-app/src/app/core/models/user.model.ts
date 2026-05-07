import { Timestamp } from 'firebase/firestore';

export type UserRole = 'moe' | 'haku' | 'sen';

export interface NikkuraUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
}
