import { Route } from '@angular/router';
import { PermissionType } from '@app/enums';
import { ClientSearchComponent } from './components/client-search/client-search.component';
import { ClientAddComponent } from './components/client-add/client-add.component';
import { ClientViewComponent } from './components/client-view/client-view.component';
import { ClientComponent } from './components/client.component';

export default [
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: '',
        component: ClientSearchComponent,
      },
      {
        path: 'add',
        component: ClientAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':idclient',
        component: ClientViewComponent,
      },
    ],
  },
] as Route[];
