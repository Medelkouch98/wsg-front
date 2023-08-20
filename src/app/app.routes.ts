import { Routes } from '@angular/router';
import { PrivateLayoutComponent } from './layout/private-layout/private-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { AuthGuard } from './core/auth/auth.guard';
import { UnAuthGuard } from './core/auth/unAuth.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [UnAuthGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/authentication/authentication.routes'),
      },
    ],
  },
  {
    path: 'p',
    component: PrivateLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'activity',
        pathMatch: 'full',
      },
      {
        path: 'activity',
        loadChildren: () => import('./features/activity/activity.routes'),
      },
      {
        path: 'commercial',
        loadChildren: () => import('./features/commercial/commercial.routes'),
      },
      {
        path: 'qualite',
        loadChildren: () => import('./features/qualite/qualite.routes'),
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes'),
      },
      {
        path: 'gestion',
        loadChildren: () => import('./features/gestion/gestion.routes'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'p',
  },
];
