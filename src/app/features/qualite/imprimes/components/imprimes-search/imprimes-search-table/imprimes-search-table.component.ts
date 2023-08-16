import { Component } from '@angular/core';
import { animate, transition, trigger } from '@angular/animations';
import { ImprimesStore } from '../../../imprimes.store';
import { Observable } from 'rxjs';
import { ICartonLiasse } from '../../../models';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { PaginatedApiResponse } from '@app/models';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';
import { ImprimesSearchTableDetailsComponent } from './imprimes-search-table-details/imprimes-search-table-details.component';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoDataSearchDirective } from '@app/directives';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-imprimes-search-table',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    AsyncPipe,
    NgIf,
    NgClass,
    DatePipe,
    TranslateModule,
    MatSortModule,
    ImprimesSearchTableDetailsComponent,
    NoDataSearchDirective,
  ],
  templateUrl: './imprimes-search-table.component.html',
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ImprimesSearchTableComponent {
  public dataSource$: Observable<PaginatedApiResponse<ICartonLiasse>> =
    this.imprimesStore.cartonsLiasses$.pipe(
      tap((response: PaginatedApiResponse<ICartonLiasse>) => {
        // dans le cas d'un seul carton en ouvre par défaut le détail des imprimés
        if (response?.data?.length === 1) {
          this.expandedElement = response?.data[0];
          if (!response?.data[0]?.liasses?.data?.length) {
            this.getLiasses(response.data[0].id);
          }
        }
      })
    );
  public page$: Observable<PageEvent> = this.imprimesStore.pageEvent$;
  public sort$: Observable<Sort> = this.imprimesStore.sort$;
  public searchClicked$: Observable<boolean> =
    this.imprimesStore.searchClicked$;
  public columns: string[] = [
    'type',
    'premier_numero',
    'dernier_numero',
    'date_livraison',
    'etat',
    'date_utilisation',
    'quantite_restante',
    'actions',
  ];
  public expandedElement: ICartonLiasse | null;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  constructor(private imprimesStore: ImprimesStore) {}

  /**
   * Récupérer les liasses
   * @param cartonLiasseId number
   */
  public getLiasses(cartonLiasseId: number) {
    this.imprimesStore.getLiasses({
      cartonLiasseId,
      sort: { active: 'date', direction: 'desc' },
    });
  }

  /**
   * changer la pagination
   * @param pageEvent PageEvent
   */
  public pageChange(pageEvent: PageEvent) {
    this.imprimesStore.setPageEvent(pageEvent);
    this.imprimesStore.imprimesSearch();
  }

  /**
   * ouvrir le tableau des liasses et récupérer les données
   * @param element ICartonLiasse
   */
  public openTableDetails(element: ICartonLiasse) {
    this.expandedElement = this.expandedElement === element ? null : element;
    if (this.expandedElement && !element.liasses?.data?.length) {
      this.getLiasses(element.id);
    }
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.imprimesStore.setSort(sort);
    this.imprimesStore.imprimesSearch();
  }
}
