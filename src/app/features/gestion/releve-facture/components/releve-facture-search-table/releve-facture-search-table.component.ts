import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReleveFactureStore } from '../../releve-facture.store';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Observable, Subscription } from 'rxjs';
import {
  IReleveFacture,
  IReleveFactureExportRequestDetails,
  ReleveFactureExportRequestDetails,
} from '../../models';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { PaginatedApiResponse } from '@app/models';
import { SelectionModel } from '@angular/cdk/collections';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { NoDataSearchDirective } from '@app/directives';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { StatusIllustrationComponent } from '@app/components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ModesReglementsSelector } from '../../../../../core/store/resources/resources.selector';
import { GetElementFromResourcePipe } from '@app/pipes';

@Component({
  selector: 'app-releve-facture-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NoDataSearchDirective,
    MatTableModule,
    TranslateModule,
    GetElementFromResourcePipe,
    MatSortModule,
    StatusIllustrationComponent,
    MatCheckboxModule,
    MatPaginatorModule,
    MatCardModule,
    MatTooltipModule,
    DecimalPipe,
  ],
  templateUrl: './releve-facture-search-table.component.html',
})
export class ReleveFactureSearchTableComponent implements OnInit, OnDestroy {
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = [
    'selectAll',
    'client',
    'reglement',
    'nb_factures',
    'nb_controle',
    'total_ttc',
    'total_regle',
    'mtDu',
    'encours_depasse',
    'facture_releve',
    'sendByEmail',
  ];
  selection = new SelectionModel<number>(true, []);
  releveFactures$: Observable<PaginatedApiResponse<IReleveFacture>> =
    this.releveFactureStore.releveFactures$;
  selectedReleveFactures$: Observable<IReleveFactureExportRequestDetails[]> =
    this.releveFactureStore.selectedReleveFactures$;
  page$: Observable<PageEvent> = this.releveFactureStore.pageEvent$;
  sort$: Observable<Sort> = this.releveFactureStore.sort$;
  searchClicked$: Observable<boolean> = this.releveFactureStore.searchClicked$;
  modesReglementsSelector = ModesReglementsSelector;
  subscription = new Subscription();

  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  constructor(
    private releveFactureStore: ReleveFactureStore,
    private router: Router
  ) {}

  ngOnInit(): void {
    //initialiser les checkbox sélectionnés
    this.subscription.add(
      this.selectedReleveFactures$.subscribe(
        (selectedReleveFactures: IReleveFactureExportRequestDetails[]) => {
          this.selection.setSelection(
            ...selectedReleveFactures.map((e) => e.client_id)
          );
        }
      )
    );
  }

  /**
   * pagination
   * @param event PageEvent
   */
  public changePage(event: PageEvent): void {
    this.releveFactureStore.setPageEvent(event);
    this.releveFactureStore.releveFactureSearch();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.releveFactureStore.setSort(sort);
    this.releveFactureStore.releveFactureSearch();
  }

  /**
   * verifier si toutes les lignes sont sélectionées
   * @param {number} numRows
   * @return {boolean}
   */
  isAllSelected(numRows: number): boolean {
    const numSelected = this.selection.selected.length;
    return numSelected === numRows;
  }

  /**
   * sélectionner our de-sélectionner les lignes
   * @param {IReleveFacture[]} releveFactures
   * @param {boolean} alreadySelected
   */
  toggleRows(releveFactures: IReleveFacture[], alreadySelected: boolean): void {
    releveFactures.forEach((releveFacture) => {
      const releveFactureExportRequestDetails =
        new ReleveFactureExportRequestDetails(
          releveFacture.client_id,
          releveFacture.recoit_facture
        );
      alreadySelected
        ? this.releveFactureStore.unselectReleveFacture(
            releveFactureExportRequestDetails
          )
        : this.releveFactureStore.selectReleveFacture(
            releveFactureExportRequestDetails
          );
    });
  }

  /**
   * sélectionner ou de-sélectionner une ligne pour l'email
   * @param {IReleveFacture} releveFacture
   */
  toggleForEmail(releveFacture: IReleveFacture): void {
    this.releveFactureStore.toggleEmail(releveFacture.client_id);
  }

  /**
   * verifier si une ligne est sélectionnée pour l'email
   * @param {IReleveFacture} releveFacture
   * @param {IReleveFactureExportRequestDetails[]} selectedReleveFactures
   * @return {boolean}
   */
  public isFactureSelectedForEmail(
    releveFacture: IReleveFacture,
    selectedReleveFactures: IReleveFactureExportRequestDetails[]
  ): boolean {
    return selectedReleveFactures.some(
      (f) => f.client_id === releveFacture.client_id && f.sendMail === true
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * rediriger vers le fiche client
   * @param {number} client_id
   */
  goToClientDetails(client_id: number): void {
    this.router.navigate(['/p/commercial/client', client_id]);
  }
}
