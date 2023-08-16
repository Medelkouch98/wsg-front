import { Route } from '@angular/router';
import { ClotureCaisseComponent } from './components/cloture-caisse.component';
import { ClotureCaisseSearchComponent } from './components/cloture-caisse-search/cloture-caisse-search.component';
import { FeuilleDeCaisseComponent } from './components/feuille-de-caisse/feuille-de-caisse.component';
import { CreateClotureCaisseComponent } from './components/create-cloture-caisse/create-cloture-caisse.component';
import { PermissionType } from '@app/enums';

export default [
  {
    path: '',
    component: ClotureCaisseComponent,
    children: [
      {
        path: '',
        component: ClotureCaisseSearchComponent,
      },
      {
        path: 'add',
        component: CreateClotureCaisseComponent,
        data: {
          accessPermissions: [PermissionType.WRITE]
        },
      },
      {
        path: ':id',
        component: FeuilleDeCaisseComponent,
      }
    ],
  },
] as Route[];
