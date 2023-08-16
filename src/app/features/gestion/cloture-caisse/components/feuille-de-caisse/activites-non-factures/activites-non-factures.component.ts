import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { IActiviteNonFactures, IDetailNonFacture } from '../../../models';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { TypePersonneEnum } from '@app/enums';

@Component({
  selector: 'app-activites-non-factures',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    MatTableModule,
    DecimalPipe,
    NgIf,
  ],
  templateUrl: './activites-non-factures.component.html',
})
export class ActivitesNonFacturesComponent {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  TypePersonneEnum = TypePersonneEnum;
  @Input() activiteNonFactures: IActiviteNonFactures;
  @Input() detailNonFactures: IDetailNonFacture[];

  public columnsActivitesNonFactures = [
    'activites_non_factures',
    'total_ht',
    'total_tva',
    'total_ttc',
  ];
  public columnsDetailsActivitesNonFactures = [
    'nom_client',
    'numero_rapport',
    'montant_ht',
    'montant_tva',
    'montant_ttc',
  ];
}
