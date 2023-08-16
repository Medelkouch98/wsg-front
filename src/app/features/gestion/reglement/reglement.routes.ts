import { Route } from '@angular/router';
import { ReglementComponent } from './components/reglement.component';
import { ReglementSearchComponent } from './components/reglement-search/reglement-search.component';
import { PermissionType } from '@app/enums';
import { ReglementAddComponent } from './components/reglement-add/reglement-add.component';
import { ReglementViewComponent } from './components/reglement-view/reglement-view.component';

export default [
  {
    path: '',
    component: ReglementComponent,
    children: [
      {
        path: '',
        component: ReglementSearchComponent,
      },
      {
        path: 'add',
        component: ReglementAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':idReglement',
        component: ReglementViewComponent,
      },
    ],
  },
] as Route[];
