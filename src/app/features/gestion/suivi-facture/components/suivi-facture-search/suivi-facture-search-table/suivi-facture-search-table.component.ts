import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { Observable, Subscription, tap } from 'rxjs';
import { IFacture, PaginatedApiResponse } from '@app/models';
import { SuiviFactureStore } from '../../../suivi-facture.store';
import { AsyncPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GetElementFromResourcePipe } from '@app/pipes';
import {
  ModesReglementsNegocieSelector,
  ModesReglementsSelector,
} from '../../../../../../core/store/resources/resources.selector';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '@app/components';
import { filter, map, take } from 'rxjs/operators';
import { FactureTypeEnum } from '../enums';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../../core/store/app.state';
import { ActivatedRoute, Router } from '@angular/router';
import { NoDataSearchComponent } from '../../../../../../shared/components/no-data-search/no-data-search.component';

@Component({
  selector: 'app-suivi-facture-search-table',
  standalone: true,
  imports: [
    GetElementFromResourcePipe,
    NgIf,
    MatTableModule,
    MatCheckboxModule,
    MatCardModule,
    AsyncPipe,
    MatPaginatorModule,
    TranslateModule,
    DatePipe,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    ConfirmationPopupComponent,
    NoDataSearchComponent,
  ],
  templateUrl: './suivi-facture-search-table.component.html',
})
export class SuiviFactureSearchTableComponent implements OnInit, OnDestroy {
  public dataSource$: Observable<PaginatedApiResponse<IFacture>> =
    this.invoiceStore.invoices$.pipe(
      tap(
        (factures: PaginatedApiResponse<IFacture>) =>
          (this.dataSource = factures)
      )
    );
  public page$: Observable<PageEvent> = this.invoiceStore.pageEvent$;
  public sort$: Observable<Sort> = this.invoiceStore.sort$;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  public displayedColumns: string[] = [
    'select',
    'nom_client',
    'reglement_negocie',
    'mandant',
    'facture_type',
    'numero_facture',
    'cloture_caisse_id',
    'date_facture',
    'montant_ttc',
    'type_reglement',
    'montant_regle',
    'solde',
    'actions',
  ];
  public dataSource: PaginatedApiResponse<IFacture> =
    new PaginatedApiResponse<IFacture>();
  public selection = new SelectionModel<number>(true, []);
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public modesReglementsSelector = ModesReglementsSelector;
  public modesReglementsNegocieSelector = ModesReglementsNegocieSelector;
  public DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public typeFacture = (value: number) => {
    return Object.keys(FactureTypeEnum).find((key) => {
      // @ts-ignore
      return FactureTypeEnum[key] === String(value);
    });
  };
  public avoirType = FactureTypeEnum.avoir;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private store: Store<AppState>,
    private invoiceStore: SuiviFactureStore,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.subscriptions.add(
      this.invoiceStore.selectedFacturesIds$.subscribe((ids: number[]) => {
        this.selection.setSelection(...ids);
      })
    );
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   * @param {number} numRows
   * @return {boolean}
   **/
  isAllSelected(numRows: number): boolean {
    const numSelected = this.selection.selected.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   * @param {IFacture[]} data
   * @param {MatCheckboxChange} event
   **/
  toggleFactures(data: IFacture[], event: MatCheckboxChange) {
    this.invoiceStore.selectUnselectFacture({
      isChecked: event.checked,
      factures: data,
    });
  }

  /**
   * changer la pagination
   * @param pageEvent PageEvent
   */
  public pageChange(pageEvent: PageEvent) {
    this.invoiceStore.setPageEvent(pageEvent);
    this.invoiceStore.InvoicesSearch();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.invoiceStore.setSort(sort);
    this.invoiceStore.InvoicesSearch();
  }

  /**
   *
   * @param factureType number
   * @param numeroFacture string
   * @param id number
   */
  public showConfirmationDialog(
    factureType: number,
    numeroFacture: string,
    id: number
  ) {
    const isAvoir = factureType.toString() === this.avoirType;
    this.subscriptions.add(
      this.dialog
        .open(ConfirmationPopupComponent, {
          data: {
            message: this.translateService.instant(
              `gestion.factures.${!isAvoir ? 'createAvoir' : 'reInvoice'}`,
              {
                value: `${numeroFacture}`,
              }
            ),
            deny: this.translateService.instant('commun.close'),
            confirm: this.translateService.instant(
              `commun.${!isAvoir ? 'createAvoir' : 'reInvoice'}`
            ),
          },
          disableClose: true,
        })
        .afterClosed()
        .pipe(
          take(1),
          filter(Boolean),
          tap(() =>
            !isAvoir
              ? this.invoiceStore.createAvoir(id)
              : this.goToRefacturation(id)
          )
        )
        .subscribe()
    );
  }

  /**
   * Rediriger vers detail facture
   * @param facture IFacture
   */
  goToDetails(facture: IFacture): void {
    this.invoiceStore.goToFacture(facture.id);
  }

  /**
   * Rediriger vers detail facture
   * @param id number
   */
  goToRefacturation(id: number): void {
    this.router.navigate(['refacturation', id], { relativeTo: this.route });
  }

  /**
   * Télécharger la facture
   * @param id number
   */
  download(id: number) {
    this.invoiceStore.downloadFacturePdf([id]);
  }

  /**
   * Envoyer la facture par mail
   * @param id number
   * @param numero_facture string
   */
  sendEmail(id: number, numero_facture: string) {
    this.invoiceStore.sendInvoiceByMail({ id, numero_facture });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
