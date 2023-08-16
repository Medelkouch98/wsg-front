import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IDetailFacture } from '../../../../models';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-detail-facture-client',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    MatTableModule,
    DecimalPipe,
    NgIf,
    MatPaginatorModule,
  ],
  templateUrl: './detail-facture-client.component.html',
})
export class DetailFactureClientComponent implements OnInit, AfterViewInit {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() detailFactures: IDetailFacture[];
  @Input() title: string;
  @Input() noDataText: string;
  dataSource: MatTableDataSource<IDetailFacture>;
  public columns = [
    'nom_client',
    'numero_facture',
    'montant_ht',
    'montant_tva',
    'montant_ttc',
    'type_reglement',
    'montant_reglement',
    'observation',
  ];

  MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.detailFactures);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
