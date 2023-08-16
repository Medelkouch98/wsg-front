import { Route } from '@angular/router';
import { FacturationClientComponent } from './components/facturation-client.component';
import { FacturationSearchComponent } from './components/facturation-search/facturation-search.component';
import { FacturationDiverseComponent } from './components/facturation-diverse/facturation-diverse.component';

export default [
  {
    path: '',
    component: FacturationClientComponent,
    children: [
      {
        path: '',
        component: FacturationSearchComponent,
      },
      {
        path: 'diverse',
        component: FacturationDiverseComponent,
      },
    ],
  },
] as Route[];
