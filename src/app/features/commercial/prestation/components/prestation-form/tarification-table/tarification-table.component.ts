import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PaginatedApiResponse } from '@app/models';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { ITarificationPrice } from '../../../models';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-tarification-table',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DecimalPipe,
  ],
  templateUrl: './tarification-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarificationTableComponent {
  @Input() public page$: Observable<PageEvent>;
  @Input() public sort$: Observable<Sort>;
  @Input() public tarifications$: Observable<
    PaginatedApiResponse<ITarificationPrice>
  >;
  @Output() changePageEvent = new EventEmitter<PageEvent>();
  @Output() sortEvent = new EventEmitter<Sort>();
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns: string[] = [
    'nom',
    'remise_euro',
    'remise_pourcentage',
    'prix_ht_remise',
    'prix_ttc_remise',
  ];
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  /**
   * changer la page
   * @param $event
   */
  public changePage($event: PageEvent): void {
    this.changePageEvent.emit($event);
  }

  /**
   * changer le tri
   * @param $event
   */
  public sortChange($event: Sort): void {
    this.sortEvent.emit($event);
  }
}
