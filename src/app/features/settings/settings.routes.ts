import { Route } from '@angular/router';
import { PermissionGuard } from '../../core/guard/permission.guard';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.routes'),
        canActivateChild: [PermissionGuard],
      },
    ],
  },
] as Route[];
