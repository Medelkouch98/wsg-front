import { Component } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { ApporteurAffaireStore } from '../../../apporteur-affaire.store';
import { IApporteurAffaire, PaginatedApiResponse } from '@app/models';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatusIllustrationComponent } from '@app/components';
import { NoDataSearchDirective } from '@app/directives';

@Component({
  selector: 'app-apporteur-affaire-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    NgIf,
    NgClass,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    StatusIllustrationComponent,
    NoDataSearchDirective,
  ],
  templateUrl: './apporteur-affaire-search-table.component.html',
})
export class ApporteurAffaireSearchTableComponent {
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = ['code', 'actif', 'nom', 'actions'];
  public apporteursAffaires$: Observable<
    PaginatedApiResponse<IApporteurAffaire>
  > = this.apporteurAffaireStore.ApporteurAffaireSearchResponseSelector$;
  public page$: Observable<PageEvent> = this.apporteurAffaireStore.PageEvent$;
  public sort$: Observable<Sort> = this.apporteurAffaireStore.Sort$;
  public searchClicked$: Observable<boolean> =
    this.apporteurAffaireStore.searchClicked$;

  constructor(private apporteurAffaireStore: ApporteurAffaireStore) {}

  /**
   * ouverture des details d'apporteur d'affaire
   * @param rowData : IApporteurAffaire
   */
  goToDetails(rowData: IApporteurAffaire): void {
    this.apporteurAffaireStore.GoToApporteurDetails({
      type: rowData.type,
      id: rowData.id,
    });
  }

  /**
   * changer la page
   * @param $event
   */
  changePage($event: PageEvent): void {
    this.apporteurAffaireStore.SetPageEvent($event);
    this.apporteurAffaireStore.ApporteurAffaireSearch();
  }

  /**
   * changer le tri
   * @param $event
   */
  sortChange($event: Sort): void {
    this.apporteurAffaireStore.SetSort($event);
    this.apporteurAffaireStore.ApporteurAffaireSearch();
  }
}
