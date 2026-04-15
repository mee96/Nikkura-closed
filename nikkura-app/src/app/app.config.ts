import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp } from "firebase/app";
import { routes } from './app.routes';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth } from 'firebase/auth/web-extension';
import { provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyCPuHZW9xAThPjsW1lZdjuid8gVXMSdkK8",
      authDomain: "nikkura-d36d0.firebaseapp.com",
      projectId: "nikkura-d36d0",
      storageBucket: "nikkura-d36d0.firebasestorage.app",
      messagingSenderId: "1053767257090",
      appId: "1:1053767257090:web:f2ff37daa529875d5cab1b",
      measurementId: "G-228Y50BVM0"
    })),
    provideAuth(() => getAuth()),
  ]
};
