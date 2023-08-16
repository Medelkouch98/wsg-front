import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { UsersStore } from '../../../users.store';
import { ICentre, IUser, PaginatedApiResponse } from '@app/models';
import { filter, take, tap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ConfirmationPopupComponent,
  StatusIllustrationComponent,
} from '@app/components';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoDataSearchDirective } from '@app/directives';
import { AppState } from 'app/core/store/app.state';
import { select, Store } from '@ngrx/store';
import { UserCurrentCentreSelector } from 'app/core/store/auth/auth.selectors';
import { RolesSelector } from '../../../../../../core/store/resources/resources.selector';
import { GetElementFromResourcePipe } from '@app/pipes';

@Component({
  selector: 'app-users-search-table',
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
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NoDataSearchDirective,
    GetElementFromResourcePipe,
  ],
  templateUrl: './users-search-table.component.html',
})
export class UsersSearchTableComponent {
  private store = inject(Store<AppState>);
  private usersStore = inject(UsersStore);
  private matDialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private router = inject(Router);

  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = ['nom', 'prenom', 'agrement', 'role', 'actif', 'actions'];
  public users$: Observable<PaginatedApiResponse<IUser>> =
    this.usersStore.users$;
  public page$: Observable<PageEvent> = this.usersStore.pageEvent$;
  public sort$: Observable<Sort> = this.usersStore.sort$;
  public searchClicked$: Observable<boolean> = this.usersStore.searchClicked$;
  public currentCentre$: Observable<ICentre> = this.store.pipe(
    select(UserCurrentCentreSelector)
  );
  public rolesSelector = RolesSelector;
  /**
   * pagination
   * @param event PageEvent
   */
  public changePage(event: PageEvent): void {
    this.usersStore.setPageEvent(event);
    this.usersStore.usersSearch();
  }
  /**
   * Trier les données
   * @param sort Sort
   */
  public sortChange(sort: Sort): void {
    this.usersStore.setSort(sort);
    this.usersStore.usersSearch();
  }

  /**
   * Rediriger vers la page details d'utilisateur
   * @param user IUser
   */
  public goToDetails(user: IUser): void {
    this.router.navigate(['/p/settings/users', user.id]);
  }

  /**
   * Supprimer l'utilisateur
   * @param user IUser
   */
  public deleteUser(user: IUser): void {
    const dialogRef = this.matDialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('users.deleteUser', {
          value: `${user.nom} ${user.prenom}`,
        }),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.usersStore.deleteUser(user);
        })
      )
      .subscribe();
  }

  public getUserRoleIdOfCurrentCentre(
    centres: { id: number; role_id: number }[],
    currentCentreId: number
  ): number {
    return centres.find(({ id }) => id === currentCentreId)?.role_id;
  }
}
