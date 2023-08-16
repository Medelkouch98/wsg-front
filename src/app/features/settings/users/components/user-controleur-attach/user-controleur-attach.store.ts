import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of,
  catchError,
  filter,
  switchMap,
  tap,
  iif,
  forkJoin,
  map,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { IWsError, WsErrorClass, IControleur, IUser } from '@app/models';
import { UsersService } from 'app/features/settings/users/services/users.service';
import { IControleurRowFormValue } from '../../models';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';

export interface UserControleurAttachState {
  unattachedControllers: IControleur[];
  users: IUser[];
  filteredUsers: IUser[];
  showCancelButton: boolean;
  errors: IWsError;
}

export const initialUsersState: UserControleurAttachState = {
  unattachedControllers: [],
  users: [],
  filteredUsers: [],
  showCancelButton: false,
  errors: null,
};

@Injectable()
export class UserControleurAttachStore extends ComponentStore<UserControleurAttachState> {
  // SELECTORS
  unattachedControllers$ = this.select(
    (state: UserControleurAttachState) => state.unattachedControllers
  );
  filteredUsers$ = this.select(
    (state: UserControleurAttachState) => state.filteredUsers
  );
  showCancelButton$ = this.select(
    (state: UserControleurAttachState) => state.showCancelButton
  );
  errors$ = this.select(
    (state: UserControleurAttachState) => state.errors
  ).pipe(filter((errors) => !!errors));

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    super(initialUsersState);
  }

  // UPDATERS
  public setUnattachedControllers = (unattachedControllers: IControleur[]) =>
    this.patchState({ unattachedControllers });
  private setUsers = (users: IUser[]) =>
    this.patchState({ users, filteredUsers: users });
  public setFilteredUsers = this.updater(
    (state: UserControleurAttachState, selectedUsersIds?: number[]) => ({
      ...state,
      filteredUsers: state.users.filter(
        (user: IUser) => !selectedUsersIds.includes(user.id)
      ),
    })
  );

  private setShowCancelButtonUsers = (showCancelButton: boolean) =>
    this.patchState({ showCancelButton });

  private setWsError = (error: HttpErrorResponse, errorMessage: string) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'users.errors.' + errorMessage
    );
    this.patchState({ errors: { ...iWsError, messageToShow } });
    this.toastr.error(messageToShow);
    return of(error);
  };

  // EFFECTS
  public getUnattachedUsers = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return this.usersService.getUnattachedUsers().pipe(
          tap((users: IUser[]) => this.setUsers(users)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'searchUsersError')
          )
        );
      })
    )
  );

  private getUnattachedControllers = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return this.authService
          .getControleurs({ utilisateur_id_null: true, actif: 1 })
          .pipe(
            tap((unattachedControllers: IControleur[]) =>
              this.setUnattachedControllers(unattachedControllers)
            ),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'getUnattachedControllersError')
            )
          );
      })
    )
  );

  /**
   * Maps the array of IControleurRowFormValue objects into an array of observables using the map() operator and performs the following steps:
   * If the user object does not have an id property, add the user to the system using usersService.addUser(), and return the resulting observable. If an error occurs, catch the error and return an observable containing the original user object.
   * If the user object already has an id property, return an observable containing the user object.
   * Attach the resulting user object to the controleur object using usersService.attachUser().
   * The resulting array of observables is then combined into a single observable using the forkJoin() operator.
   */
  public attachUsers = this.effect(
    (formValues$: Observable<IControleurRowFormValue[]>) =>
      formValues$.pipe(
        map((formValues: IControleurRowFormValue[]) =>
          formValues.map(
            ({ controleur, user, login, email }: IControleurRowFormValue) =>
              iif(
                () => !user.id,
                this.usersService.addUser({ ...user, login, email }).pipe(
                  catchError(() => {
                    this.toastr.error(
                      this.translateService.instant(
                        'users.addSpecificUserError',
                        { value: `${user.nom} ${user.prenom}` }
                      )
                    );
                    return of({ ...user, login, email });
                  })
                ),
                of(user)
              ).pipe(
                switchMap((user) =>
                  this.usersService.attachUser(controleur.id, user.id)
                )
              )
          )
        ),
        switchMap((data) =>
          forkJoin(data).pipe(
            tap(() => {
              this.toastr.success(
                this.translateService.instant('users.attachUsersSuccess')
              );
              this.dialog.closeAll();
            }),
            catchError((error: HttpErrorResponse) => {
              this.getUnattachedControllers();
              this.setShowCancelButtonUsers(true);
              return this.setWsError(error, 'searchUsersError');
            })
          )
        )
      )
  );
}
