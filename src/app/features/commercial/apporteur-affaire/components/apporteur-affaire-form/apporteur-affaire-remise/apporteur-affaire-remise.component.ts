import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApporteurAffaireStore } from '../../../apporteur-affaire.store';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { map } from 'rxjs/operators';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { IApporteurAffaireNationalRemise } from '../../../models/apporteur_affaire-national-remise.model';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';

@Component({
  selector: 'app-apporteur-affaire-remise',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './apporteur-affaire-remise.component.html',
})
export class ApporteurAffaireRemiseComponent {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource$: Observable<
    MatTableDataSource<IApporteurAffaireNationalRemise>
  > = this.apporteurAffaireStore.ApporteurAffaireNationalRemiseSelector$.pipe(
    map((remises: IApporteurAffaireNationalRemise[]) => {
      const dataSource = new MatTableDataSource(remises);
      dataSource.sort = this.sort;
      dataSource.paginator = this.paginator;
      return dataSource;
    })
  );

  public columns = [
    'type_controle',
    'energie',
    'categorie_ct',
    'type',
    'valeur',
  ];
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  constructor(private apporteurAffaireStore: ApporteurAffaireStore) {}
}
