import { Component, Input } from '@angular/core';
import { IFactureNonRegle, IFactureRegle } from '../../../models';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { TypePersonneEnum } from '@app/enums';
import { DetailFactureEncaisseComponent } from './detail-facture-encaisse/detail-facture-encaisse.component';

@Component({
  selector: 'app-factures-encaisses',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    DetailFactureEncaisseComponent,
  ],
  templateUrl: './factures-encaisses.component.html',
})
export class FacturesEncaissesComponent {
  @Input() facturesRegles: IFactureRegle[];
  @Input() facturesNonRegles: IFactureNonRegle[];
  TypePersonneEnum = TypePersonneEnum;

  /**
   * récupérer les factures par type de client
   * @param {TypePersonneEnum} typePersonneEnum
   * @return {IFactureRegle[]}
   */
  getFactureByClientType(typePersonneEnum: TypePersonneEnum):IFactureRegle[] {
    return this.facturesRegles?.filter(
      (d) => d.type_client === typePersonneEnum
    );
  }
}
