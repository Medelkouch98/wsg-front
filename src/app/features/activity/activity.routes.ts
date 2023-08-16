import { Route } from '@angular/router';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { DailyActivityComponent } from './components/daily-activity/daily-activity.component';
import { TechnicalFileComponent } from './components/technical-file/technical-file.component';
import { ActivityComponent } from './components/activity.component';
import { PermissionGuard } from '../../core/guard/permission.guard';

export default [
  {
    path: '',
    component: ActivityComponent,
    canActivateChild: [PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'planning',
        pathMatch: 'full',
      },
      {
        path: 'planning',
        component: DailyActivityComponent,
      },
      {
        path: 'search',
        component: AdvancedSearchComponent,
      },
      {
        path: 'fiche/:idControl',
        component: TechnicalFileComponent,
      },
    ],
  },
] as Route[];
