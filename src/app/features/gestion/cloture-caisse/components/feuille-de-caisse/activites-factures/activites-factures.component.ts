import { Component, Input } from '@angular/core';
import { IActiviteFactures, IDetailFacture } from '../../../models';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { DatePipe, DecimalPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { DetailFactureClientComponent } from './detail-facture-client/detail-facture-client.component';
import { TypePersonneEnum } from '@app/enums';
import { ActivitesFacturesTableComponent } from './activites-factures-table/activites-factures-table.component';

@Component({
  selector: 'app-activites-factures',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    MatTableModule,
    DecimalPipe,
    DatePipe,
    NgIf,
    DetailFactureClientComponent,
    NgTemplateOutlet,
    ActivitesFacturesTableComponent,
  ],
  templateUrl: './activites-factures.component.html',
})
export class ActivitesFacturesComponent {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  TypePersonneEnum = TypePersonneEnum;
  @Input() activiteFactures: IActiviteFactures;
  @Input() detailFactures: IDetailFacture[];

  public columns = ['date_facture', 'total_ht', 'total_tva', 'total_ttc'];

  /**
   * recuperer les details de facture par type de client
   * @param {TypePersonneEnum} typePersonneEnum
   * @return {IDetailFacture[] | undefined}
   */
  getDetailFactureByClientType(typePersonneEnum: TypePersonneEnum) {
    return this.detailFactures?.filter(
      (d) => d.type_client === typePersonneEnum
    );
  }
}
