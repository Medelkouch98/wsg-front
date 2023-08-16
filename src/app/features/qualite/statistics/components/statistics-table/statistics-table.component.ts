import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';

@Component({
  selector: 'app-statistics-table',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    AsyncPipe,
    TranslateModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './statistics-table.component.html',
})
export class StatisticsTableComponent implements OnChanges, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() data: any[];
  @Input() columns: string[];
  @Input() showFooter = false;

  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public statistics: MatTableDataSource<any>;
  public total: any;

  /**
   * Remove the last element from Data if the showFooter input is truthy,
   * Set the statistics property to a new instance of MatTableDataSource  data value.
   */
  ngOnChanges({ data, showFooter }: SimpleChanges): void {
    if (data.currentValue?.length) {
      const dataTable = [...data.currentValue];
      if (showFooter?.currentValue) {
        this.total = dataTable.pop();
      }
      this.statistics = new MatTableDataSource(dataTable);
    }
  }

  /**
   * Set paginator property of the statistics instance to the paginator view child if showFooter properties is truthy.
   */
  ngAfterViewInit(): void {
    if (this.statistics && this.showFooter) {
      this.statistics.paginator = this.paginator;
    }
  }
}
