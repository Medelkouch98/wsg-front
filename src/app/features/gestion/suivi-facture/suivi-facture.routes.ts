import { Route } from '@angular/router';
import { RefacturationComponent } from './components/refacturation/refacturation.component';
import { SuiviFactureComponent } from './components/suivi-facture.component';
import { SuiviFactureSearchComponent } from './components/suivi-facture-search/suivi-facture-search.component';
import { SuiviFactureDetailsComponent } from './components/suivi-facture-details/suivi-facture-details.component';

export default [
  {
    path: '',
    component: SuiviFactureComponent,
    children: [
      {
        path: '',
        component: SuiviFactureSearchComponent,
      },
      {
        path: ':idFacture',
        component: SuiviFactureDetailsComponent,
      },
      {
        path: 'refacturation/:idFacture',
        component: RefacturationComponent,
      },
    ],
  },
] as Route[];
