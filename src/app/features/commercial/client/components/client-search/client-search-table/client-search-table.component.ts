import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ClientStore } from '../../../client.store';
import { IClient, PaginatedApiResponse } from '@app/models';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatusIllustrationComponent } from '@app/components';
import { NoDataSearchDirective } from '@app/directives';

@Component({
  selector: 'app-client-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
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
  ],
  templateUrl: './client-search-table.component.html',
})
export class ClientSearchTableComponent {
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = [
    'type',
    'code',
    'nom',
    'cp',
    'ville',
    'actif',
    'date_derniere_prestation',
    'actions',
  ];
  public clients$: Observable<PaginatedApiResponse<IClient>> =
    this.clientsStore.clients$;
  public page$: Observable<PageEvent> = this.clientsStore.pageEvent$;
  public sort$: Observable<Sort> = this.clientsStore.sort$;
  public searchClicked$: Observable<boolean> = this.clientsStore.searchClicked$;

  constructor(private clientsStore: ClientStore) {}

  /**
   * pagination
   * @param event PageEvent
   */
  public changePage(event: PageEvent): void {
    this.clientsStore.setPageEvent(event);
    this.clientsStore.clientsSearch();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.clientsStore.setSort(sort);
    this.clientsStore.clientsSearch();
  }

  /**
   * Rediriger vers la fiche client
   * @param client IClient
   */
  public redirectToFiche(client: IClient): void {
    this.clientsStore.goToDetailClient(client.id);
  }
}
