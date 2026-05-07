import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth } from 'firebase/auth';
import { provideAuth } from '@angular/fire/auth';
import { getFirestore } from 'firebase/firestore';
import { provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: 'AIzaSyCPuHZW9xAThPjsW1lZdjuid8gVXMSdkK8',
  authDomain: 'nikkura-d36d0.firebaseapp.com',
  projectId: 'nikkura-d36d0',
  storageBucket: 'nikkura-d36d0.firebasestorage.app',
  messagingSenderId: '1053767257090',
  appId: '1:1053767257090:web:f2ff37daa529875d5cab1b',
  measurementId: 'G-228Y50BVM0',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
