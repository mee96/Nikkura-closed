import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';

import { auth } from '../../firebase';
import { UserModel } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🔥 REGISTER
  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // 🔑 LOGIN
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // 🚪 LOGOUT
  logout(): Promise<void> {
    return signOut(auth);
  }

  // 👤 MAP FIREBASE USER → TU MODEL
  mapUser(user: FirebaseUser): UserModel {
    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      role: 'moe', // default Nikkura vibe
      createdAt: Date.now()
    };
  }
}