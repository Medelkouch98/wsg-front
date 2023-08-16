import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();
  constructor(private translateService: TranslateService) {}

  // Change labels of Mat-paginator
  firstPageLabel = this.translateService.instant('table.firstPage');
  itemsPerPageLabel = this.translateService.instant('table.itemsPerPage');
  lastPageLabel = this.translateService.instant('table.lastPage');
  nextPageLabel = this.translateService.instant('table.nextPage');
  previousPageLabel = this.translateService.instant('table.previousPage');

  /**
   * get a label for the range of items within
   * the current page and the length of the whole list
   * @param page number
   * @param pageSize number
   * @param length number
   * @return string
   */
  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.translateService.instant('table.pageOf', {
        page: 1,
        amountPages: 1,
      });
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.translateService.instant('table.pageOf', {
      page: page + 1,
      amountPages,
    });
  }
}
