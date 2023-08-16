import { Component } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { IClotureCaisseSearchResponse } from '../../../models';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { PaginatedApiResponse } from '@app/models';
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
import { filter, map, take, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { GetElementFromResourcePipe } from '@app/pipes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../../core/store/app.state';

@Component({
  selector: 'app-cloture-caisse-search-table',
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
  templateUrl: './cloture-caisse-search-table.component.html',
})
export class ClotureCaisseSearchTableComponent {
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = [
    'numero_cloture',
    'date_debut',
    'date_fin',
    'realise_par',
    'actions',
  ];
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  clotureCaisseList$: Observable<
    PaginatedApiResponse<IClotureCaisseSearchResponse>
  > = this.clotureCaisseStore.clotureCaisseList$;
  page$: Observable<PageEvent> = this.clotureCaisseStore.pageEvent$;
  sort$: Observable<Sort> = this.clotureCaisseStore.sort$;
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  constructor(
    private clotureCaisseStore: ClotureCaisseStore,
    private router: Router,
    private matDialog: MatDialog,
    private store: Store<AppState>,
    private toasterService: ToastrService,
    private translateService: TranslateService
  ) {}

  /**
   * pagination
   * @param event PageEvent
   */
  public changePage(event: PageEvent): void {
    this.clotureCaisseStore.setPageEvent(event);
    this.clotureCaisseStore.clotureCaisseSearch();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.clotureCaisseStore.setSort(sort);
    this.clotureCaisseStore.clotureCaisseSearch();
  }

  /**
   * supprimer une cloture de caisse
   * @param {IClotureCaisseSearchResponse} clotureCaisse
   */
  delete(clotureCaisse: IClotureCaisseSearchResponse) {
    const dialogRef = this.matDialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('commun.confirmDeleteElement'),
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
          this.clotureCaisseStore.deleteClotureCaisse(clotureCaisse.id);
        })
      )
      .subscribe();
  }

  /**
   * ouvrir les details d'une cloture de caisse
   * @param {IClotureCaisseSearchResponse} clotureCaisse
   */
  goToFeuilleDeCaisse(clotureCaisse: IClotureCaisseSearchResponse) {
    this.clotureCaisseStore.goToFeuilleDeClotureCaisse(clotureCaisse.id);
  }
}
