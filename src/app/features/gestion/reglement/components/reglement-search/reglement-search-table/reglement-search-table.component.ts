import { Component } from '@angular/core';
import { ReglementStore } from '../../../reglement.store';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { IReglement } from '../../../models';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { IFacture, PaginatedApiResponse } from '@app/models';
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { NoDataSearchDirective } from '@app/directives';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationPopupComponent } from '@app/components';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter, take, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { GetElementFromResourcePipe } from '@app/pipes';
import { ModesReglementsSelector } from '../../../../../../core/store/resources/resources.selector';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TypePersonneEnum } from '@app/enums';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reglement-search-table',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NoDataSearchDirective,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    TranslateModule,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    NgForOf,
    GetElementFromResourcePipe,
    MatTooltipModule,
  ],
  templateUrl: './reglement-search-table.component.html',
})
export class ReglementSearchTableComponent {
  readonly NUMBER_OF_FACTURES_TO_SHOW = 2;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = [
    'date_reglement',
    'numero_cloture_caisse',
    'mode_reglement_id',
    'facture',
    'client',
    'reference',
    'montant',
    'actions',
  ];
  modesReglementsSelector = ModesReglementsSelector;
  reglements$: Observable<PaginatedApiResponse<IReglement>> =
    this.reglementStore.reglementsList$;
  page$: Observable<PageEvent> = this.reglementStore.pageEvent$;
  sort$: Observable<Sort> = this.reglementStore.sort$;
  searchClicked$: Observable<boolean> = this.reglementStore.searchClicked$;

  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  constructor(
    private reglementStore: ReglementStore,
    private router: Router,
    private matDialog: MatDialog,
    private toasterService: ToastrService,
    private translateService: TranslateService
  ) {}

  /**
   * pagination
   * @param event PageEvent
   */
  public changePage(event: PageEvent): void {
    this.reglementStore.setPageEvent(event);
    this.reglementStore.reglementSearch();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.reglementStore.setSort(sort);
    this.reglementStore.reglementSearch();
  }

  /**
   * supprimer un règlement
   * RG24:
   *      Pour un client en compte:
   *          Lorsque l'utilisateur clique sur le bouton et que le règlement est lié à une
   *          facture/avoir alors un toaster "Impossible de supprimer le règlement car il est
   *          lié à une Facture/Avoir." apparaît.
   *
   *      Pour un client de passage:
   *          Lorsque l'utilisateur clique sur le bouton et que le règlement a été effectué dans
   *          Websur Contrôle alors un toaster "Impossible de supprimer le règlement d'un client
   *          passager effectué dans Websur Controle" apparaît.
   * @param {IReglement} reglement
   * @param {string} date
   * @param {string} type
   * @param {string} montant
   */
  delete(reglement: IReglement, date: string, type: string, montant: string) {
    if (reglement?.client_type === TypePersonneEnum.COMPTE) {
      if (reglement?.factures?.some((f) => f.avoir)) {
        this.toasterService.warning(
          this.translateService.instant(
            'gestion.errors.impossibleDeSupprimerReglementFactureAvoir'
          )
        );
        return;
      }
    }
    if (reglement?.client_type === TypePersonneEnum.PASSAGE) {
      if (!!reglement?.websur_controle_id) {
        this.toasterService.warning(
          this.translateService.instant(
            'gestion.errors.impossibleDeSupprimerReglementWebSurControle'
          )
        );
        return;
      }
    }
    const dialogRef = this.matDialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant(
          'gestion.reglements.deleteConfirmation',
          { date, type, montant }
        ),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.reglementStore.deleteReglement(reglement.id);
        })
      )
      .subscribe();
  }

  /**
   * ouvrir les details d'un reglement
   * @param {IReglement} reglement
   */
  edit(reglement: IReglement) {
    this.reglementStore.goToReglementsDetails(reglement.id);
  }

  /**
   * afficher les numéros de factures restants
   * @param {IFacture[]} factures
   * @return {string}
   */
  getTooltipText(factures: IFacture[]): string {
    return factures.map((facture) => facture?.numero_facture).join(', ');
  }
}
