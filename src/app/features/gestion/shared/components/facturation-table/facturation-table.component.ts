import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { animate, transition, trigger } from '@angular/animations';
import {
  DECIMAL_NUMBER_PIPE_FORMAT,
  NUMBER_FORMAT_TREE_DECIMALS,
} from '@app/config';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
import { IDetailPrestation, IPrestationFacture } from '@app/models';
import { ITotalFacture } from './models';
import { FacturationStore } from '../../facturation.store';
import { FactureTypeEnum } from '../../enums';
import { FacturationDetailsTableComponent } from './facturation-details-table/facturation-details-table.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IPrestationFormGroup, IPrestationRowsForm } from '../../models';

@Component({
  selector: 'app-facturation-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    TranslateModule,
    NgClass,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    NgIf,
    MatInputModule,
    AsyncPipe,
    FacturationDetailsTableComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './facturation-table.component.html',
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturationTableComponent implements OnInit, OnDestroy {
  @Input() set prestationFormGroup(form: FormGroup<IPrestationFormGroup>) {
    this.prestationsForm = form;
    this.dataSource = new MatTableDataSource(
      form.controls.prestationsRowsForm.controls
    );
  }
  public prestationsForm: FormGroup<IPrestationFormGroup>;
  public totalFacture$: Observable<ITotalFacture[]> =
    this.facturationStore.totalFacture$;
  public columns: string[] = [
    'select',
    'code',
    'libelle',
    'quantite',
    'baseHt',
    'montantRemiseTtc',
    'montantHtOtc',
    'montantTtcOtc',
    'expand',
  ];
  public totalColumns: string[] = [
    'total_montant_ht',
    'total_ht_otc',
    'totat_ht',
    'total_tva',
    'total_ttc',
    'restant_payer',
  ];
  public expandedElement: string | null;
  public dataSource = new MatTableDataSource<FormGroup<IPrestationRowsForm>>();
  public DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public NUMBER_FORMAT_TREE_DECIMALS = NUMBER_FORMAT_TREE_DECIMALS;
  public prestationsSelection = new SelectionModel<string>(true, []);
  public factureType: FactureTypeEnum;
  public FactureTypeEnum = FactureTypeEnum;
  private subs: Subscription = new Subscription();

  constructor(private facturationStore: FacturationStore) {}

  ngOnInit() {
    this.subs.add(
      this.facturationStore.expandedPrestation$.subscribe(
        (expandedPresta: string) => (this.expandedElement = expandedPresta)
      )
    );
    this.subs.add(
      this.facturationStore.detailsSelection$.subscribe(
        (detailsPrestation: Map<string, Map<number, IDetailPrestation>>) => {
          this.prestationsSelection.setSelection(
            ...Array.from(detailsPrestation.keys())
          );
        }
      )
    );

    this.subs.add(
      this.facturationStore.factureType$.subscribe(
        (factureType: FactureTypeEnum) => {
          this.factureType = factureType;
          if (factureType === FactureTypeEnum.FACTURE_DIVERSE)
            this.totalColumns = this.totalColumns.filter(
              (row: string) =>
                row !== 'total_montant_ht' &&
                row !== 'total_ht_otc' &&
                row !== 'restant_payer'
            );
        }
      )
    );
  }

  /**
   * check if the number of selected elements matches the total number of rows.
   * @param {number} numRows
   * @return {boolean}
   */
  isAllSelected(numRows: number): boolean {
    const numSelected = this.prestationsSelection.selected.length;
    return numSelected === numRows;
  }

  /**
   * sélectionner our de-sélectionner les lignes
   * @param prestations IPrestationFacture[]
   * @param event MatCheckboxChange
   */
  togglePrestations(
    prestations: IPrestationFacture[],
    event: MatCheckboxChange
  ) {
    prestations.forEach((row: IPrestationFacture) => {
      this.facturationStore.selectOrUnSelectDetailPrestation({
        detailsPrestation: row.details,
        isChecked: event.checked,
      });
    });
  }

  /**
   * expande table details
   * @param {string} codePrestation
   */
  public openTableDetails(codePrestation: string) {
    this.facturationStore.setExpandedPrestation(
      this.expandedElement === codePrestation ? null : codePrestation
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
