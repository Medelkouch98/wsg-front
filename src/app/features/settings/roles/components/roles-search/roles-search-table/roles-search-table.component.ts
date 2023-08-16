import { Router } from '@angular/router';
import { Component, ViewChild, inject } from '@angular/core';
import { Observable, filter, tap } from 'rxjs';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { RolesStore } from '../../../roles.store';
import { IRole } from '@app/models';
import { TranslateModule } from '@ngx-translate/core';
import {
  ConfirmationPopupComponent,
  StatusIllustrationComponent,
} from '@app/components';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoDataSearchDirective } from '@app/directives';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-roles-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    TranslateModule,
    ConfirmationPopupComponent,
    StatusIllustrationComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NoDataSearchDirective,
  ],
  templateUrl: './roles-search-table.component.html',
})
export class RolesSearchTableComponent {
  private rolesStore = inject(RolesStore);
  private router = inject(Router);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = ['nom', 'is_reference', 'actions'];
  public roles$: Observable<IRole[]> = this.rolesStore.filteredRoles$.pipe(
    filter((roles) => !!roles),
    tap((roles) => {
      if (this.roles) {
        // If roles already exist, update the data property with new roles
        this.roles.data = [...roles];
      } else {
        // If roles do not exist, create a new MatTableDataSource with roles as data
        this.roles = new MatTableDataSource<IRole>(roles);
      }
      setTimeout(() => {
        this.roles.paginator = this.paginator;
        this.roles.sort = this.sort;
      });
    })
  );

  public roles: MatTableDataSource<IRole>;

  /**
   * Navigates to the permissions page for the given role.
   * @param role IRole.
   */
  public goToDetails(role: IRole): void {
    this.router.navigate(['/p/settings/roles', role.id]);
  }
}
