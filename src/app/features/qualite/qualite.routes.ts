import { Route } from '@angular/router';
import { PermissionGuard } from '../../core/guard/permission.guard';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'materiel',
        pathMatch: 'full',
      },
      {
        path: 'materiel',
        loadChildren: () => import('./material/material.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'liasse',
        loadChildren: () => import('./imprimes/imprimes.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'audit',
        loadChildren: () => import('./audit/audit.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'exploitant-centre',
        loadChildren: () =>
          import('./exploitant-centre/exploitant-centre.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'statistiques-vl',
        loadChildren: () => import('./statistics/statistics.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'compteurs',
        loadChildren: () => import('./compteurs/compteurs.routes'),
        canActivateChild: [PermissionGuard],
      },
    ],
  },
] as Route[];
