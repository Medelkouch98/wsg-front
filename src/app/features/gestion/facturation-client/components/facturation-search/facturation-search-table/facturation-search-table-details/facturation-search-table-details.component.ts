import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  IControle,
  IClientControleNonFactures,
  IControleSelection,
} from '../../../../models';
import { animate, transition, trigger } from '@angular/animations';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { FacturationClientStore } from '../../../../facturation-client.store';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-facturation-search-table-details',
  standalone: true,
  imports: [
    NgIf,
    MatTableModule,
    MatCheckboxModule,
    TranslateModule,
    MatIconModule,
    NgClass,
    MatButtonModule,
    AsyncPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './facturation-search-table-details.component.html',
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class FacturationSearchTableDetailsComponent
  implements OnInit, OnDestroy
{
  @Input() controleNonFacturer: IClientControleNonFactures;
  public columns: string[] = [
    'select',
    'immatriculation',
    'proprietaire',
    'date_edition',
    'expand',
  ];
  public columnsPrestations: string[] = ['libelle', 'montant_ttc'];
  public expandedElement: IControle | null;
  public DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public clientsSelection = new SelectionModel<IControleSelection>(true, []);
  public subs: Subscription = new Subscription();

  constructor(private facturationClientProStore: FacturationClientStore) {}

  ngOnInit() {
    this.subs.add(
      this.facturationClientProStore.selectedClients$.subscribe(
        (controlesSelection: IControleSelection[]) => {
          this.clientsSelection.setSelection(...controlesSelection);
        }
      )
    );
  }

  /**
   * check if the row is selected
   * @param {number} controleId
   * @param {number} clientId
   * @return boolean
   */
  checkIsSelectedRow(controleId: number, clientId: number): boolean {
    return !!this.clientsSelection.selected.find(
      (item: IControleSelection) =>
        item.client_id === clientId && item.controles_id.includes(controleId)
    );
  }

  /**
   * check uncheck control
   * @param {MatCheckboxChange} event
   * @param {IClientControleNonFactures} element
   * @param {number} controlId
   */
  toggleControl(
    event: MatCheckboxChange,
    element: IClientControleNonFactures,
    controlId: number
  ) {
    this.facturationClientProStore.selectUnselectControl({
      isChecked: event.checked,
      selection: {
        client_id: element.id,
        controles_id: [controlId],
        multi_pv: element.multi_pv,
        email: element.email,
      },
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
