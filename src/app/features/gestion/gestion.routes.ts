import { Route } from '@angular/router';
import { ReleveFactureComponent } from './releve-facture/components/releve-facture.component';
import { PermissionGuard } from '../../core/guard/permission.guard';

export default [
  {
    path: '',
    children: [
      {
        path: 'releve-facture',
        component: ReleveFactureComponent,
        canActivate: [PermissionGuard],
      },
      {
        path: 'cloture',
        loadChildren: () => import('./cloture-caisse/cloture-caisse.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'reglements',
        loadChildren: () => import('./reglement/reglement.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'factures',
        loadChildren: () => import('./suivi-facture/suivi-facture.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'exports',
        loadChildren: () => import('./exports/exports.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'export-sap-tuv',
        loadChildren: () => import('./export-sap-tuv/export-sap-tuv.routes'),
        canActivateChild: [PermissionGuard],
      },
      {
        path: 'facturation',
        loadChildren: () =>
          import('./facturation-client/facturation-client.routes'),
        canActivateChild: [PermissionGuard],
      },
    ],
  },
] as Route[];
