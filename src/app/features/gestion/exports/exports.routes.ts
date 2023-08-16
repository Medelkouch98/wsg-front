import { Route } from '@angular/router';
import { ExportsComponent } from './components/exports.component';
import { ExportsSearchComponent } from './components/exports-search/exports-search.component';

export default [
  {
    path: '',
    component: ExportsComponent,
    children: [
      {
        path: '',
        component: ExportsSearchComponent,
      },
    ],
  },
] as Route[];
