import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { ClotureCaisseStore } from '../../cloture-caisse.store';
import { Observable } from 'rxjs';
import { IFeuilleDeCaisse } from '../../models';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { ActivitesFacturesComponent } from './activites-factures/activites-factures.component';
import { DetailFactureClientComponent } from './activites-factures/detail-facture-client/detail-facture-client.component';
import { TypePersonneEnum } from '@app/enums';
import { ActivitesNonFacturesComponent } from './activites-non-factures/activites-non-factures.component';
import { FacturesEncaissesComponent } from './factures-encaisses/factures-encaisses.component';
import { SortieDeCaisseComponent } from './sortie-de-caisse/sortie-de-caisse.component';
import { SaisieDesEncaissementsComponent } from './saisie-des-encaissements/saisie-des-encaissements.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-feuille-de-caisse',
  standalone: true,
  imports: [
    TranslateModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    ActivitesFacturesComponent,
    ActivitesNonFacturesComponent,
    DetailFactureClientComponent,
    FacturesEncaissesComponent,
    SortieDeCaisseComponent,
    SaisieDesEncaissementsComponent,
    MatButtonModule,
    AsyncPipe,
    DatePipe,
    NgIf,
  ],
  templateUrl: './feuille-de-caisse.component.html',
})
export class FeuilleDeCaisseComponent {
  TypePersonneEnum = TypePersonneEnum;
  feuilleDeCaisse$: Observable<IFeuilleDeCaisse> =
    this.clotureCaisseStore.feuilleDeCaisse$;
  constructor(private clotureCaisseStore: ClotureCaisseStore) {
    this.clotureCaisseStore.getFeuilleDeCaisse();
  }
}
