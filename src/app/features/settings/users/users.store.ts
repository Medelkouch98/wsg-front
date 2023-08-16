import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import {
  PaginatedApiResponse,
  IWsError,
  WsErrorClass,
  IUser,
  User,
} from '@app/models';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { GestionModulesService, SharedService } from '@app/services';
import {
  IDesactivationMotif,
  IRNC2User,
  IUsersSearch,
  UsersSearch,
} from './models';
import { UsersService } from './services/users.service';
import {
  Observable,
  of,
  catchError,
  filter,
  switchMap,
  tap,
  withLatestFrom,
  map,
} from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AppState } from 'app/core/store/app.state';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { Params, Router } from '@angular/router';
import { exportFile } from '@app/helpers';
import { PermissionType } from '@app/enums';
import { ExploitantCentreService } from 'app/features/qualite/exploitant-centre/services/exploitant-centre.service';

export interface UsersState {
  users: PaginatedApiResponse<IUser>;
  searchForm: IUsersSearch;
  searchClicked: boolean;
  sort: Sort;
  pageEvent: PageEvent;
  user: IUser;
  rnc2User: IRNC2User;
  desactivationMotifs: IDesactivationMotif[];
  isAddRoleGranted: boolean;
  exploitantCentreExists: boolean;
  errors: IWsError;
}

export const initialUsersState: UsersState = {
  users: null,
  searchForm: new UsersSearch(),
  searchClicked: false,
  sort: { active: 'nom', direction: 'asc' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  user: new User(),
  rnc2User: null,
  desactivationMotifs: [],
  isAddRoleGranted: false,
  exploitantCentreExists: false,
  errors: null,
};

@Injectable()
export class UsersStore extends ComponentStore<any> {
  // SELECTORS
  users$ = this.select((state: UsersState) => state.users);
  sort$ = this.select((state: UsersState) => state.sort);
  searchForm$ = this.select((state: UsersState) => state.searchForm);
  searchClicked$ = this.select((state: UsersState) => state.searchClicked);
  pageEvent$ = this.select((state: UsersState) => state.pageEvent);
  user$ = this.select((state: UsersState) => state.user);
  rnc2User$ = this.select((state: UsersState) => state.rnc2User);
  desactivationMotifs$ = this.select(
    (state: UsersState) => state.desactivationMotifs
  );
  isAddRoleGranted$ = this.select(
    (state: UsersState) => state.isAddRoleGranted
  );
  exportCertificateEnabled$ = this.select(
    (state: UsersState) => state.exploitantCentreExists
  );
  errors$ = this.select((state: UsersState) => state.errors).pipe(
    filter((errors) => !!errors)
  );

  constructor(
    private usersService: UsersService,
    private exploitantCentreService: ExploitantCentreService,
    private translateService: TranslateService,
    private router: Router,
    private store: Store<AppState>,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private gestionModulesService: GestionModulesService
  ) {
    super(initialUsersState);
  }

  // UPDATERS
  /**
   * Sets the sort criteria for the list of users and resets the page index to 0.
   *
   * @param {UsersState} state - The current state of the app.
   * @param {Sort} sort - The new sort criteria to apply.
   * @return {UsersState} The new state of the app with the updated sort criteria and reset page index.
   */
  public setSort = this.updater((state: UsersState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  public setPageEvent = (pageEvent: PageEvent) =>
    this.patchState({ pageEvent });

  /**
   * Sets the search form criteria for the list of users and resets the page index to 0.
   *
   * @param {UsersState} state - The current state of the app.
   * @param {IUsersSearch} searchForm - The new search criteria to apply.
   * @return {UsersState} The new state of the app with the updated search form criteria and reset page index.
   */
  public setSearchForm = this.updater(
    (state: UsersState, searchForm: IUsersSearch) => ({
      ...state,
      searchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  public resetSearchForm = () =>
    this.patchState({ searchForm: new UsersSearch() });

  public initUser = () =>
    this.patchState({
      user: new User(),
      exploitantCentreExists: false,
      isAddRoleGranted: false,
    });

  public initRNC2User = () => this.patchState({ rnc2User: null });

  public setDesactivationMotifs = (
    desactivationMotifs: IDesactivationMotif[]
  ) => this.patchState({ desactivationMotifs });

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
  public usersSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.sort$, this.searchForm$, this.pageEvent$),
      switchMap(([_, sort, searchForm, pageEvent]) => {
        const query = this.sharedService.getQuery(
          searchForm,
          pageEvent.pageIndex + 1,
          pageEvent.pageSize,
          sort
        );
        return this.usersService.searchUsers(query).pipe(
          tap((users: PaginatedApiResponse<IUser>) =>
            this.patchState({ users })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'searchUsersError')
          )
        );
      })
    )
  );

  public getUser = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.usersService.getUser(+params['iduser']).pipe(
          tap((user: IUser) => this.patchState({ user })),
          catchError((error: HttpErrorResponse) => {
            this.router.navigate(['/p/settings/users']);
            return this.setWsError(error, 'userInfosFicheError');
          })
        )
      )
    )
  );

  public addUser = this.effect((user$: Observable<IUser>) =>
    user$.pipe(
      switchMap((user: IUser) =>
        this.usersService.addUser(user).pipe(
          tap((_user: IUser) => {
            this.toastr.success(
              this.translateService.instant('users.addUserSuccess')
            );
            this.usersSearch();
            this.router.navigate(['/p/settings/users']);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'addUserError')
          )
        )
      )
    )
  );

  public updateUser = this.effect((user$: Observable<Partial<IUser>>) =>
    user$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([user, params]: [Partial<IUser>, Params]) =>
        this.usersService.updateUser(params['iduser'], user).pipe(
          tap((user: IUser) => {
            this.toastr.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.patchState({ user });
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'updateUserError')
          )
        )
      )
    )
  );

  public deleteUser = this.effect((user$: Observable<IUser>) =>
    user$.pipe(
      switchMap((user: IUser) =>
        this.usersService.deleteUser(user.id).pipe(
          tap(() => {
            this.toastr.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.usersSearch();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteUserError')
          )
        )
      )
    )
  );

  public getRNC2User = this.effect((agrementVl$: Observable<string>) =>
    agrementVl$.pipe(
      switchMap((agrementVl: string) =>
        this.usersService.getRNC2User(agrementVl).pipe(
          tap((rnc2User: IRNC2User) => this.patchState({ rnc2User })),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(
              error,
              error.status === 400 ? 'userRNC2NotFound' : 'userRNC2Error'
            )
          )
        )
      )
    )
  );

  public getDesactivationMotifs = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_) =>
        this.usersService.getDesactivationMotifs().pipe(
          tap((desactivationMotifs: IDesactivationMotif[]) =>
            this.patchState({ desactivationMotifs })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'desactivationMotifsError')
          )
        )
      )
    )
  );

  public exportPdfUsers = this.effect((searchForm$: Observable<IUsersSearch>) =>
    searchForm$.pipe(
      switchMap((searchForm: IUsersSearch) => {
        const query = this.sharedService.getSearchQuery({ ...searchForm });
        return this.usersService.exportPdfUsers(query).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportPdfError')
          )
        );
      })
    )
  );

  public getAddRolePermission = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_: void) =>
        this.gestionModulesService
          .findPermissionsByUrl('p/settings/roles/add')
          .pipe(
            tap((permissions: PermissionType[]) =>
              this.patchState({
                isAddRoleGranted: permissions.includes(PermissionType.WRITE),
              })
            ),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'addRolePermissionCheck')
            )
          )
      )
    )
  );

  public checkExploitantCentreExists = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_: void) =>
        this.exploitantCentreService.getExploitantCentre({ par_page: 1 }).pipe(
          map(({ data }) => !!data.length),
          tap((exploitantCentreExists: boolean) =>
            this.patchState({ exploitantCentreExists })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'checkExploitantCentreExistsError')
          )
        )
      )
    )
  );

  public exportCertificateError = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.user$),
      switchMap(([_, user]: [void, IUser]) => {
        return this.usersService.exportCertificate(user.controleur.id).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportCertificateError')
          )
        );
      })
    )
  );
}
