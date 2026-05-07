import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/register/register').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/search/search').then((m) => m.SearchComponent),
  },
  {
    path: 'anime/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/anime-detail/anime-detail').then(
        (m) => m.AnimeDetailComponent,
      ),
  },
  {
    path: 'collection',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/collection/collection').then(
        (m) => m.CollectionComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
