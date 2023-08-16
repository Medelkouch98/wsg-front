import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuditStore } from '../../../audit.store';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { PaginatedApiResponse } from '@app/models';
import { IAudits } from '../../../models';
import { animate, transition, trigger } from '@angular/animations';
import { AsyncPipe, DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuditResultTableComponent } from './audit-result-table/audit-result-table.component';
import { IAuditSearchForm } from '../audit-search-form/models';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoDataSearchDirective } from '@app/directives';
import { MatSortModule, Sort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../../core/store/auth/auth.selectors';
import { map } from 'rxjs/operators';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../../core/store/app.state';

@Component({
  selector: 'app-audit-search-table',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    AsyncPipe,
    TranslateModule,
    DatePipe,
    NgStyle,
    AuditResultTableComponent,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    NoDataSearchDirective,
  ],
  templateUrl: './audit-search-table.component.html',
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AuditSearchTableComponent {
  public dataSource$: Observable<PaginatedApiResponse<IAudits>> =
    this.auditStore.audits$;
  public pageEvent$: Observable<PageEvent> = this.auditStore.pageEvent$;
  public searchForm$: Observable<IAuditSearchForm> =
    this.auditStore.searchForm$;
  public sort$: Observable<Sort> = this.auditStore.sort$;
  public searchClicked$: Observable<boolean> = this.auditStore.searchClicked$;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  public columns: string[] = [
    'auditeur',
    'date_audit',
    'result',
    'numero_pv',
    'agrement_centre_rattachement',
    'actions',
  ];
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public expandedElement: IAudits | null;

  constructor(private auditStore: AuditStore, private store: Store<AppState>) {}

  /**
   * changer la pagination
   * @param pageEvent PageEvent
   */
  public pageChange(pageEvent: PageEvent): void {
    this.auditStore.setPageEvent(pageEvent);
    this.auditStore.searchAudits();
  }

  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.auditStore.setSort(sort);
    this.auditStore.searchAudits();
  }
}
