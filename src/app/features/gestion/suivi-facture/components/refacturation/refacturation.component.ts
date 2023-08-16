import { Component } from '@angular/core';
import { SuiviFactureStore } from '../../suivi-facture.store';
import { Observable } from 'rxjs';
import { IFacture } from '@app/models';
import { FacturationComponent } from '../../../shared/facturation.component';
import { IFactureRequest } from '../../../shared/models';

@Component({
  selector: 'app-refacturation',
  standalone: true,
  imports: [FacturationComponent],
  template: `
    <app-facturation
      [dataFacture$]="facture$"
      (action)="validerFacture($event)"
    ></app-facturation>
  `,
})
export class RefacturationComponent {
  facture$: Observable<IFacture> = this.factureStore.facture$;
  constructor(private factureStore: SuiviFactureStore) {
    this.factureStore.getInvoice({ query: `?from=avoir` });
  }

  /**
   * Valider la facture
   * @param {IFactureRequest} facture
   */
  validerFacture(facture: IFactureRequest) {
    this.factureStore.refacturer(facture);
  }
}
