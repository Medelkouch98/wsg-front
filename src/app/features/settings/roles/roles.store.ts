import { Injectable } from '@angular/core';
import { IWsError, IRole } from '@app/models';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of,
  catchError,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppState } from 'app/core/store/app.state';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { RouterParamsSelector } from 'app/core/store/router/router.selector';
import { Params, Router } from '@angular/router';
import { RolesService } from './services/roles.service';
import { IRolesSearch, RolesSearch } from './models/roles-search.model';
import { IRoleFormGroupValue } from './models';
import { SharedService } from '@app/services';
import { filterRoles } from './helpers/roles.heplers';
import { GetRoles } from 'app/core/store/resources/resources.actions';

export interface RolesState {
  allRoles: IRole[];
  filteredRoles: IRole[];
  searchForm: IRolesSearch;
  role: IRole;
  errors: IWsError;
}

export const initialRolesState: RolesState = {
  allRoles: [],
  filteredRoles: null,
  searchForm: new RolesSearch(),
  role: null,
  errors: null,
};

@Injectable()
export class RolesStore extends ComponentStore<any> {
  // SELECTORS
  public allRoles$ = this.select((state: RolesState) => state.allRoles);
  public filteredRoles$ = this.select(
    (state: RolesState) => state.filteredRoles
  );
  public searchForm$ = this.select((state: RolesState) => state.searchForm);
  public role$ = this.select((state: RolesState) => state.role);
  public errors$ = this.select((state: RolesState) => state.errors).pipe(
    filter((errors) => !!errors)
  );

  constructor(
    private rolesService: RolesService,
    private translateService: TranslateService,
    private router: Router,
    private store: Store<AppState>,
    private toaster: ToastrService,
    private sharedService: SharedService
  ) {
    super(initialRolesState);
  }

  // UPDATERS

  /**
   * Sets the roles and updates the filtered roles based on the provided roles array.
   *
   * @param {RolesState} state - The current state of the roles.
   * @param {IRole[]} allRoles - The new array of roles to set.
   * @returns {RolesState} - The new state with updated roles and filteredRoles.
   */
  public setRoles = this.updater((state: RolesState, allRoles: IRole[]) => ({
    ...state,
    allRoles,
    filteredRoles: filterRoles(allRoles, state.searchForm),
  }));

  /**
   * Sets search parameters and filters roles based on search criteria
   *
   * @param {RolesState} state - The current state of the roles
   * @param {IRolesSearch} searchForm - The new search criteria to apply.
   * @returns {RolesState} - The new state with searchForm and filteredRoles
   */
  public setSearch = this.updater(
    (state: RolesState, searchForm: IRolesSearch) => ({
      ...state,
      searchForm,
      filteredRoles: filterRoles(state.allRoles, searchForm),
    })
  );

  public resetSearchForm = () =>
    this.patchState({ searchForm: new RolesSearch() });

  public initRole = () => this.patchState({ role: null });

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = true
  ) => {
    this.patchState({
      errors: this.sharedService.getWsError(
        error,
        `roles.errors.${errorMessage}`,
        showToaster
      ),
    });
    return of(error);
  };

  // EFFECTS
  public rolesSearch = this.effect((trigger$) =>
    trigger$.pipe(switchMap(() => this.searchRoles()))
  );

  public getRole = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.rolesService.getRole(+params['idrole']).pipe(
          tap((role: IRole) => this.patchState({ role })),
          catchError((error: HttpErrorResponse) => {
            this.router.navigate(['/p/settings/roles']);
            return this.setWsError(error, 'roleFicheError');
          })
        )
      )
    )
  );

  public addRole = this.effect((role$: Observable<IRole>) =>
    role$.pipe(
      switchMap((role: IRole) =>
        this.rolesService.addRole(role).pipe(
          switchMap((role: IRole) => {
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
            void this.router.navigate(['/p/settings/roles']);

            this.store.dispatch(GetRoles());
            return this.searchRoles();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'addRoleError')
          )
        )
      )
    )
  );

  public updatePermissions = this.effect(
    (role$: Observable<IRoleFormGroupValue>) =>
      role$.pipe(
        switchMap((role: IRoleFormGroupValue) =>
          this.rolesService.updateRole(role).pipe(
            switchMap((_: void) => {
              this.toaster.success(
                this.translateService.instant('commun.operationTerminee')
              );

              this.store.dispatch(GetRoles());
              return this.searchRoles();
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'updateRoleError')
            )
          )
        )
      )
  );

  /**
   * Retrieves the roles by calling the searchRoles method of the rolesService.
   * Updates the state with the retrieved roles and handles any errors that occur.
   *
   * @returns {Observable<IRole[] | HttpErrorResponse>} - An Observable that emits the retrieved roles or an HttpErrorResponse.
   */
  private searchRoles(): Observable<IRole[] | HttpErrorResponse> {
    // Call the searchRoles method of the rolesService to get all roles
    return this.rolesService.searchRoles().pipe(
      // When the roles are returned, update the state to reflect all roles and filtered roles
      tap((allRoles: IRole[]) => {
        this.setRoles(allRoles);
      }),
      catchError((error: HttpErrorResponse) =>
        this.setWsError(error, 'searchRolesError')
      )
    );
  }
}
