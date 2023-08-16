import { Route } from '@angular/router';
import { PermissionType } from '@app/enums';
import { UsersComponent } from './components/users.component';
import { UsersSearchComponent } from './components/users-search/users-search.component';
import { UserAddComponent } from './components/user-add/user-add.component';
import { UserViewComponent } from './components/user-view/user-view.component';

export default [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        component: UsersSearchComponent,
      },
      {
        path: 'add',
        component: UserAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':iduser',
        component: UserViewComponent,
      },
    ],
  },
] as Route[];
