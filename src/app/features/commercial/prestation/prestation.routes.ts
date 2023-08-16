import { Route } from '@angular/router';
import { PermissionType } from '@app/enums';
import { PrestationSearchComponent } from './components/prestation-search/prestation-search.component';
import { PrestationAddComponent } from './components/prestation-add/prestation-add.component';
import { PrestationViewComponent } from './components/prestation-view/prestation-view.component';
import { PrestationComponent } from './components/prestation.component';

export default [
  {
    path: '',
    component: PrestationComponent,
    children: [
      {
        path: '',
        component: PrestationSearchComponent,
      },
      {
        path: 'add',
        component: PrestationAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':id',
        component: PrestationViewComponent,
      },
    ],
  },
] as Route[];
