import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IMaterialEvent } from '../../../models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { EventTypePipe } from '../../../pipes';

@Component({
  selector: 'app-material-events-table',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    AsyncPipe,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    EventTypePipe,
  ],
  templateUrl: './material-events-table.component.html',
})
export class MaterialEventsTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  @Input() set materialEvents(value: IMaterialEvent[]) {
    this.events.data = value?.length ? [...value] : [];
  }
  @Output() public popUpEventForm = new EventEmitter<IMaterialEvent>();
  @Output() public deleteEvent = new EventEmitter<number>();
  public events = new MatTableDataSource<IMaterialEvent>([]);
  public eventColumns: string[] = [
    'materiel_evenement_type_id',
    'date',
    'actions',
  ];

  /**
   * Sets up the paginator and sort for the table after the view is initialized.
   */
  ngAfterViewInit(): void {
    if (this.events.data.length) {
      this.events.paginator = this.paginator;
      this.events.sort = this.sort;
    }
  }
}
