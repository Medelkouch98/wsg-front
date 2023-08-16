import { Route } from '@angular/router';
import { ImprimesComponent } from './components/imprimes.component';
import { ImprimesSearchComponent } from './components/imprimes-search/imprimes-search.component';
import { ImprimesCancelComponent } from './components/imprimes-cancel/imprimes-cancel.component';
import { ImprimesPretComponent } from './components/imprimes-pret/imprimes-pret.component';

export default [
  {
    path: '',
    component: ImprimesComponent,
    children: [
      {
        path: '',
        component: ImprimesSearchComponent,
      },
      {
        path: 'cancel',
        component: ImprimesCancelComponent,
      },
      {
        path: 'pret',
        component: ImprimesPretComponent,
      },
    ],
  },
] as Route[];
