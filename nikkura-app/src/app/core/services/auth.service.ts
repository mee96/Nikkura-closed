import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Router } from '@angular/router';
import { NikkuraUser, UserRole } from '../models/user.model';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly currentUser = signal<NikkuraUser | null>(null);
  readonly isLoading = signal(true);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  private get db() { return getFirestore(); }

  constructor() {
    onAuthStateChanged(this.auth, async (fbUser: FirebaseUser | null) => {
      try {
        if (fbUser) {
          const userData = await this.fetchUserData(fbUser.uid);
          this.currentUser.set(userData);
          if (userData?.role) {
            this.themeService.setTheme(userData.role);
          }
        } else {
          this.currentUser.set(null);
        }
      } catch {
        this.currentUser.set(null);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(credential.user, { displayName });

    const userData = {
      uid: credential.user.uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(this.db, 'users', credential.user.uid), userData);
    this.currentUser.set(userData as unknown as NikkuraUser);
    this.themeService.setTheme(role);
    await this.router.navigate(['/home']);
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const userData = await this.fetchUserData(credential.user.uid);
    if (userData) {
      this.currentUser.set(userData);
      this.themeService.setTheme(userData.role);
    }
    await this.router.navigate(['/home']);
  }

  async updateRole(role: UserRole): Promise<void> {
    const uid = this.currentUser()?.uid;
    if (!uid) return;
    await updateDoc(doc(this.db, 'users', uid), { role });
    this.currentUser.update((u) => (u ? { ...u, role } : null));
    this.themeService.setTheme(role);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser.set(null);
    this.themeService.setTheme('moe');
    await this.router.navigate(['/auth/login']);
  }

  private async fetchUserData(uid: string): Promise<NikkuraUser | null> {
    const snap = await getDoc(doc(this.db, 'users', uid));
    return snap.exists() ? (snap.data() as NikkuraUser) : null;
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email': 'El formato del email no es válido',
        'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
      };
      return messages[code ?? ''] ?? error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }
}
