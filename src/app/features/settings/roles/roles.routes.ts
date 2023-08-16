import { Route } from '@angular/router';
import { RolesComponent } from './components/roles.component';
import { RolesSearchComponent } from './components/roles-search/roles-search.component';
import { RoleAddComponent } from './components/role-add/role-add.component';
import { PermissionType } from '@app/enums';
import { RoleViewComponent } from './components/role-view/role-view.component';

export default [
  {
    path: '',
    component: RolesComponent,
    children: [
      {
        path: '',
        component: RolesSearchComponent,
      },
      {
        path: 'add',
        component: RoleAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':idrole',
        component: RoleViewComponent,
      },
    ],
  },
] as Route[];
