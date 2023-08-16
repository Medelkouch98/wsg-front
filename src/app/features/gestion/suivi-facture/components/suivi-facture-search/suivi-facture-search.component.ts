import { Component, OnDestroy, OnInit } from '@angular/core';
import { SuiviFactureSearchFormComponent } from './suivi-facture-search-form/suivi-facture-search-form.component';
import { SuiviFactureSearchTableComponent } from './suivi-facture-search-table/suivi-facture-search-table.component';
import { ActionsButtonsComponent } from '@app/components';
import { IActionsButton, IFacture, PaginatedApiResponse } from '@app/models';
import { combineLatest, Subscription } from 'rxjs';
import { SuiviFactureStore } from '../../suivi-facture.store';
import { DirectionEnum, ExportTypeEnum, PermissionType } from '@app/enums';
@Component({
  selector: 'app-suivi-facture-search',
  standalone: true,
  imports: [
    SuiviFactureSearchFormComponent,
    SuiviFactureSearchTableComponent,
    ActionsButtonsComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    ></app-actions-buttons>
    <app-suivi-facture-search-form></app-suivi-facture-search-form>
    <app-suivi-facture-search-table></app-suivi-facture-search-table>
  `,
})
export class SuiviFactureSearchComponent implements OnInit, OnDestroy {
  buttons: IActionsButton[] = [];
  selectedIds: number[] = [];
  subscriptions: Subscription = new Subscription();
  constructor(private invoiceStore: SuiviFactureStore) {}

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([
        this.invoiceStore.invoices$,
        this.invoiceStore.selectedFacturesIds$,
      ]).subscribe(
        ([factures, ids]: [PaginatedApiResponse<IFacture>, number[]]) => {
          this.selectedIds = ids;
          this.buttons = [
            {
              libelle: 'commun.exportPdf',
              direction: DirectionEnum.LEFT,
              action: 'exportPdf',
              icon: 'picture_as_pdf',
              customColor: 'green',
              permissions: [PermissionType.EXPORT],
              display: !!factures?.data?.length,
            },
            {
              libelle: 'commun.exportXls',
              direction: DirectionEnum.LEFT,
              action: 'exportXls',
              icon: 'description',
              customColor: 'green',
              permissions: [PermissionType.EXPORT],
              display: !!factures?.data?.length,
            },
            {
              libelle: 'commun.download',
              direction: DirectionEnum.RIGHT,
              action: 'download',
              permissions: [PermissionType.WRITE],
              display: !!ids?.length,
            },
          ];
        }
      )
    );

    this.invoiceStore.InvoicesSearch();
  }

  /**
   * gestion des actions
   * @param {string} action
   */
  public handleActions(action: string): void {
    switch (action) {
      case 'exportXls':
        this.invoiceStore.invoiceExport(ExportTypeEnum.xls);
        break;
      case 'exportPdf':
        this.invoiceStore.invoiceExport(ExportTypeEnum.pdf);
        break;
      case 'download':
        this.invoiceStore.downloadFacturePdf(this.selectedIds);
        break;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
