import { Component, Input } from '@angular/core';
import { ILiasse } from '../../../../models';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { ImprimesStore } from '../../../../imprimes.store';
import { PaginatedApiResponse } from '@app/models';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-imprimes-search-table-details',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    AsyncPipe,
    NgIf,
    NgClass,
    TranslateModule,
    DatePipe,
    MatSortModule,
  ],
  templateUrl: './imprimes-search-table-details.component.html',
})
export class ImprimesSearchTableDetailsComponent {
  @Input() cartonId: number;
  @Input() sort: Sort;
  @Input()
  set liasses(liasses: PaginatedApiResponse<ILiasse>) {
    this.dataSourceLiasse = liasses?.data;
    const metaLiasses = liasses?.meta;
    this.pageEvent = {
      pageIndex: metaLiasses?.current_page - 1,
      pageSize: metaLiasses?.per_page,
      length: metaLiasses?.total,
    };
  }
  public dataSourceLiasse: ILiasse[] = [];
  public pageEvent: PageEvent;
  public columnsLiasse: string[] = [
    'premier_numero',
    'dernier_numero',
    'date',
    'commentaire',
    'type_liasse',
    'etat',
    'controle',
  ];
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  constructor(private imprimesStore: ImprimesStore) {}

  /**
   * Rédiriger vers la fiche controle
   * @param idcontrole number
   */
  public goToFicheControle(idcontrole: number) {
    this.imprimesStore.goToFicheControle(idcontrole);
  }

  /**
   * changer la pagination
   * @param pageEvent PageEvent
   */
  public pageChange(pageEvent: PageEvent) {
    this.imprimesStore.getLiasses({
      cartonLiasseId: this.cartonId,
      pageEvent,
      sort: this.sort,
    });
  }

  public sortChange(sort: Sort): void {
    this.imprimesStore.getLiasses({
      cartonLiasseId: this.cartonId,
      pageEvent: { ...this.pageEvent, pageIndex: 0 },
      sort,
    });
  }
}
