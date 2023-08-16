import { Route } from '@angular/router';
import { MaterialComponent } from './components/material.component';
import { MaterialSearchComponent } from './components/material-search/material-search.component';
import { MaterialAddComponent } from './components/material-add/material-add.component';
import { PermissionType } from '@app/enums';
import { MaterialViewComponent } from './components/material-view/material-view.component';
import { MaterialCurrentMaintenanceDateComponent } from './components/material-add-event/material-current-maintenance-date/material-current-maintenance-date.component';
import { MaterialMaintenaceContratComponent } from './components/material-add-event/material-maintenace-contrat/material-maintenace-contrat.component';

export default [
  {
    path: '',
    component: MaterialComponent,
    children: [
      {
        path: '',
        component: MaterialSearchComponent,
      },
      {
        path: 'add',
        component: MaterialAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: 'date-entretien',
        component: MaterialCurrentMaintenanceDateComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: 'contrat-maintenance',
        component: MaterialMaintenaceContratComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':idmaterial',
        component: MaterialViewComponent,
      },
    ],
  },
] as Route[];
