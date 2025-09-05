import { Routes } from '@angular/router';
import { loggedGuard, tokenGuard } from './shared/guard/auth.guard';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => AuthComponent,
    canActivate: [loggedGuard],
  },
  {
    path: 'bcp',
    loadChildren: () => import('./pages/bcp/bcp.routes').then((c) => c.pagesRoutes),
    canActivate: [tokenGuard],
  },
  {
    path: 'ibk',
    loadChildren: () => import('./pages/ibk/ibk.routes').then((c) => c.pagesRoutes),
    canActivate: [tokenGuard],
  },
  {
    path: '',
    loadChildren: () => import('./pages/yape/yape.routes').then((c) => c.pagesRoutes),
    canActivate: [tokenGuard],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
