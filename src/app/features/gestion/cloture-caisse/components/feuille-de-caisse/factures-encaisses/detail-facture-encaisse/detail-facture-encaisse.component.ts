import { Component, Input } from '@angular/core';
import { IFactureNonRegle, IFactureRegle } from '../../../../models';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';

@Component({
  selector: 'app-detail-facture-encaisse',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    MatTableModule,
    DecimalPipe,
    NgIf,
    DatePipe,
  ],
  templateUrl: './detail-facture-encaisse.component.html',
})
export class DetailFactureEncaisseComponent {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  @Input() factures: IFactureRegle[] | IFactureNonRegle[];
  @Input() title: string;

  public columns = [
    'nom_client',
    'numero_facture',
    'montant_ttc',
    'type_reglement',
    'reference_reglement',
    'montant_regle',
    'montant_restant',
    'date_facture',
    'date_reglement',
  ];
}
