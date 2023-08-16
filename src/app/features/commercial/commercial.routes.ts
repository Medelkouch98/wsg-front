import { Route } from '@angular/router';
import { PermissionGuard } from '../../core/guard/permission.guard';
import { TarificationValidators } from './tarification/validators/tarification.validators';

export default [
  {
    path: '',
    providers: [TarificationValidators],
    children: [
      {
        path: '',
        redirectTo: 'client',
        pathMatch: 'full',
      },
      {
        path: 'client',
        loadChildren: () => import('./client/client.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'apporteur-affaire',
        loadChildren: () =>
          import('./apporteur-affaire/apporteur-affaire.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'prestations',
        loadChildren: () => import('./prestation/prestation.routes'),
        canActivateChild: [PermissionGuard],
      },
    ],
  },
] as Route[];
