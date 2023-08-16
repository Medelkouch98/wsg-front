import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { IFeuilleDeCaisse } from '../../../models';
import { MatTableModule } from '@angular/material/table';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { TypeComptageEnum } from '../../../enums';

@Component({
  selector: 'app-saisie-des-encaissements',
  standalone: true,
  imports: [
    TranslateModule,
    MatExpansionModule,
    MatTableModule,
    DecimalPipe,
    NgIf,
  ],
  templateUrl: './saisie-des-encaissements.component.html',
})
export class SaisieDesEncaissementsComponent {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  TypeComptageEnum = TypeComptageEnum;
  @Input() feuilleDeCaisse: IFeuilleDeCaisse;
  public columnsReglementsSummaryTable = [
    'mode_reglement',
    'fond_de_caisse',
    'encaissements_saisis',
    'sortie_de_caisse',
    'factures_passage_payees',
    'factures_credit_payees',
    'nouveau_fond_de_caisse',
  ];
  public columnsEcartsTable = ['type', 'montant', 'commentaire'];
}
