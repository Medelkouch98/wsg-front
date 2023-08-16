import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { animate, transition, trigger } from '@angular/animations';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { Observable, Subscription } from 'rxjs';
import { PaginatedApiResponse } from '@app/models';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { FacturationClientStore } from '../../../facturation-client.store';
import {
  IClientControleNonFactures,
  IControleSelection,
} from '../../../models';
import { FacturationSearchTableDetailsComponent } from './facturation-search-table-details/facturation-search-table-details.component';
import { SelectionModel } from '@angular/cdk/collections';
import { GenerateFacturePopupComponent } from '../../generate-facture-popup/generate-facture-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { NoDataSearchComponent } from '../../../../../../shared/components/no-data-search/no-data-search.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-facturation-search-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatPaginatorModule,
    MatIconModule,
    TranslateModule,
    MatButtonModule,
    MatCheckboxModule,
    NgIf,
    AsyncPipe,
    NgClass,
    FacturationSearchTableDetailsComponent,
    DecimalPipe,
    NoDataSearchComponent,
  ],
  templateUrl: './facturation-search-table.component.html',
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class FacturationSearchTableComponent implements OnInit, OnDestroy {
  public dataSource$: Observable<
    PaginatedApiResponse<IClientControleNonFactures>
  > = this.facturationClientProStore.searchResult$;
  public page$: Observable<PageEvent> =
    this.facturationClientProStore.pageEvent$;
  public sort$: Observable<Sort> = this.facturationClientProStore.sort$;
  public controleSelection$: Observable<IControleSelection[]> =
    this.facturationClientProStore.selectedClients$;
  public columns: string[] = [
    'select',
    'nom',
    'cp',
    'ville',
    'date_premier_controle',
    'date_dernier_controle',
    'nb_controles',
    'total_ttc',
    'email',
    'multi_pv',
    'expand',
  ];
  public expandedElement: IClientControleNonFactures | null;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public clientsSelection = new SelectionModel<number>(true, []);
  public dateFacturation: string;
  private subs: Subscription = new Subscription();

  constructor(
    private facturationClientProStore: FacturationClientStore,
    private matDialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.subs.add(
      this.facturationClientProStore.selectedClients$.subscribe(
        (controlesSelection: IControleSelection[]) => {
          this.clientsSelection.setSelection(
            ...controlesSelection.map(
              (item: IControleSelection) => item.client_id
            )
          );
        }
      )
    );

    // Récupérer date facturation
    this.facturationClientProStore.getFacturationDate();
    this.subs.add(
      this.facturationClientProStore.dateFacturation$.subscribe(
        (dateFacturation: string) => (this.dateFacturation = dateFacturation)
      )
    );
  }

  /**
   * Vérifier si toutes les lignes sont sélectionnées
   * @param {number} numRows
   * @return boolean
   */
  isAllSelected(numRows: number): boolean {
    const numSelected = this.clientsSelection.selected.length;
    return numSelected === numRows;
  }

  /**
   * check uncheck client row
   * @param {IClientControleNonFactures []} clients
   * @param {MatCheckboxChange} event
   */
  toggleClients(
    clients: IClientControleNonFactures[],
    event: MatCheckboxChange
  ) {
    this.facturationClientProStore.selectUnselectClient({
      isChecked: event.checked,
      clients,
    });
  }

  /**
   * check uncheck multi_pv or email
   * @param {string} field
   * @param {number} clientId
   */
  changeMultiPvOrEmail(field: string, clientId: number) {
    this.facturationClientProStore.checkUnCheckMultiPvOrEmail({
      field,
      clientId,
    });
  }

  /**
   * changer la pagination
   * @param {PageEvent} pageEvent
   */
  public pageChange(pageEvent: PageEvent) {
    this.facturationClientProStore.setPageEvent(pageEvent);
    this.facturationClientProStore.searchControles();
  }

  /**
   * Trier les données
   * @param {Sort} sort
   */
  public sortChange(sort: Sort): void {
    this.facturationClientProStore.setSort(sort);
    this.facturationClientProStore.searchControles();
  }

  /**
   * Ouvrir la popup du génération de la facture
   */
  public openFactureGenerateFacture() {
    this.matDialog.open(GenerateFacturePopupComponent, {
      injector: Injector.create({
        providers: [
          {
            provide: FacturationClientStore,
            useValue: this.facturationClientProStore,
          },
        ],
      }),
      data: { dateFacturation: this.dateFacturation },
      disableClose: true,
      minWidth: this.breakpointObserver.isMatched('(max-width: 1024px)')
        ? '75%'
        : '50%',
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
