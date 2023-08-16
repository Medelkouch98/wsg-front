import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { IFacturesClient } from '../../../../models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DatePipe, DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-activites-factures-table',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatTableModule,
    TranslateModule,
    MatPaginatorModule,
    DatePipe,
    DecimalPipe,
    NgIf,
  ],
  templateUrl: './activites-factures-table.component.html',
})
export class ActivitesFacturesTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() title: string;
  @Input() footerTitle: string;
  @Input() facturesClients: IFacturesClient[];
  dataSource: MatTableDataSource<IFacturesClient>;
  public columns = ['date_facture', 'total_ht', 'total_tva', 'total_ttc'];
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;

  MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.facturesClients);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * calculer le total {field} de factures, par exemple le total_ht, total_tv ...
   * @param {IFacturesClient[]} dataSource
   * @param {keyof IFacturesClient} field
   * @return {string}
   */
  getTotal(
    dataSource: IFacturesClient[],
    field: keyof IFacturesClient
  ): string {
    return dataSource
      ?.map((facture) => +facture[field])
      .reduce((sum, currentValue) => sum + currentValue, 0)
      ?.toFixed(2);
  }
}
