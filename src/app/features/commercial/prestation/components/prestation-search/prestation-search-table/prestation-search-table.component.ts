import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PrestationStore } from '../../../prestation.store';
import { Observable } from 'rxjs/internal/Observable';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { IPrestation, PaginatedApiResponse } from '@app/models';
import { AsyncPipe, NgIf, NgClass, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StatusIllustrationComponent } from '@app/components';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoDataSearchDirective } from '@app/directives';

@Component({
  selector: 'app-prestation-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    TranslateModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    StatusIllustrationComponent,
    NoDataSearchDirective,
    DecimalPipe,
  ],
  templateUrl: './prestation-search-table.component.html',
})
export class PrestationSearchTableComponent {
  public page$: Observable<PageEvent> = this.prestationStore.PageEvent$;
  public sort$: Observable<Sort> = this.prestationStore.Sort$;
  public searchClicked$: Observable<boolean> =
    this.prestationStore.searchClicked$;
  public prestations$: Observable<PaginatedApiResponse<IPrestation>> =
    this.prestationStore.PrestationSearchResponseSelector$;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns: string[] = [
    'code',
    'libelle',
    'prixht',
    'tva',
    'prixTTC',
    'soumis_redevance',
    'actif',
    'actions',
  ];
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  constructor(
    private router: Router,
    private prestationStore: PrestationStore
  ) {}

  /**
   * ouverture des details de prestation
   * @param rowData : IPrestation
   */
  public goToDetails(rowData: IPrestation): void {
    this.router.navigate(['/p/commercial/prestations/', rowData.id]);
  }

  /**
   * changer la page
   * @param $event
   */
  public changePage($event: PageEvent): void {
    this.prestationStore.SetPageEvent($event);
    this.prestationStore.PrestationSearch();
  }

  /**
   * changer le tri
   * @param $event
   */
  public sortChange($event: Sort): void {
    this.prestationStore.SetSort($event);
    this.prestationStore.PrestationSearch();
  }
}
