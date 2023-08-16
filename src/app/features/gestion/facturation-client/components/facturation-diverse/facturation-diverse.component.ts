import { Component } from '@angular/core';
import { FacturationComponent } from '../../../shared/facturation.component';
import { FactureTypeEnum } from '../../../shared/enums';
import { IFactureRequest } from '../../../shared/models';
import { FacturationClientStore } from '../../facturation-client.store';

@Component({
  selector: 'app-facturation-diverse',
  standalone: true,
  imports: [FacturationComponent],
  template: `
    <app-facturation
      [factureType]="FactureTypeEnum.FACTURE_DIVERSE"
      (action)="validerFacture($event)"
    ></app-facturation>
  `,
})
export class FacturationDiverseComponent {
  public FactureTypeEnum = FactureTypeEnum;
  constructor(private facturationClientProStore: FacturationClientStore) {}

  /**
   * Valider la facture
   * @param {IFactureRequest} facture
   */
  validerFacture(facture: IFactureRequest) {
    this.facturationClientProStore.createFactureDiverse(facture);
  }
}
