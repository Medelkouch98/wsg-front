import { Route } from '@angular/router';
import { PermissionType } from '@app/enums';
import { ApporteurAffaireSearchComponent } from './components/apporteur-affaire-search/apporteur-affaire-search.component';
import { ApporteurAffaireAddComponent } from './components/apporteur-affaire-add/apporteur-affaire-add.component';
import { ApporteurAffaireViewComponent } from './components/apporteur-affaire-view/apporteur-affaire-view.component';
import { ApporteurAffaireComponent } from './components/apporteur-affaire.component';

export default [
  {
    path: '',
    component: ApporteurAffaireComponent,
    children: [
      {
        path: '',
        component: ApporteurAffaireSearchComponent,
      },
      {
        path: 'local/add',
        component: ApporteurAffaireAddComponent,
        data: {
          accessPermissions: [PermissionType.WRITE],
        },
      },
      {
        path: ':type/:id',
        component: ApporteurAffaireViewComponent,
      },
    ],
  },
] as Route[];
