import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../app.state';
import * as resourceActions from './resources.actions';
import * as resourceSelectors from './resources.selector';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import {
  ICalledRessources,
  ICategorie,
  ICivilite,
  IEcheance,
  IEnergie,
  IFamilleIT,
  IMarque,
  IModele,
  IModeReglement,
  IPrestation,
  IRole,
  ITva,
  ITypeControle,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { ResourcesService } from '@app/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ResourcesEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private resourcesService: ResourcesService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  GetModesReglement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetModesReglement),
      switchMap(() =>
        this.resourcesService.getModesReglements().pipe(
          map((response: PaginatedApiResponse<IModeReglement>) =>
            resourceActions.GetModesReglementSuccess({
              modesReglements: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'modes de réglement',
              })
            );
            return of(
              resourceActions.GetModesReglementError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'modesReglements',
                value: true,
              })
            )
          )
        )
      )
    )
  );
  GetTypesControle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetTypesControle),
      switchMap(() =>
        this.resourcesService.getTypesControle().pipe(
          map((response: PaginatedApiResponse<ITypeControle>) =>
            resourceActions.GetTypesControleSuccess({
              typesControles: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'controles types',
              })
            );
            return of(
              resourceActions.GetTypesControleError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'typesControles',
                value: true,
              })
            )
          )
        )
      )
    )
  );
  GetCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetCategories),
      switchMap(() =>
        this.resourcesService.getCategories().pipe(
          map((response: PaginatedApiResponse<ICategorie>) =>
            resourceActions.GetCategoriesSuccess({
              categories: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'catégories',
              })
            );
            return of(
              resourceActions.GetCategoriesError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'categories',
                value: true,
              })
            )
          )
        )
      )
    )
  );
  GetEnergies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetEnergie),
      switchMap(() =>
        this.resourcesService.getEnergies().pipe(
          map((response: PaginatedApiResponse<IEnergie>) =>
            resourceActions.GetEnergieSuccess({
              energies: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'energies',
              })
            );
            return of(
              resourceActions.GetEnergieError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'energies',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetCivilites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetCivilites),
      switchMap(() =>
        this.resourcesService.getCivilites().pipe(
          map((response: PaginatedApiResponse<ICivilite>) =>
            resourceActions.GetCivilitesSuccess({
              civilites: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'civilites',
              })
            );
            return of(
              resourceActions.GetCivilitesError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'civilites',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetEcheances$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetEcheances),
      switchMap(() =>
        this.resourcesService.getEcheances().pipe(
          map((response: PaginatedApiResponse<IEcheance>) =>
            resourceActions.GetEcheanceSuccess({
              echeances: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'echeances',
              })
            );
            return of(
              resourceActions.GetEcheanceError({
                echeances: [],
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'echeances',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetPrestations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetPrestations),
      switchMap(() =>
        this.resourcesService.getPrestations().pipe(
          map((response: PaginatedApiResponse<IPrestation>) =>
            resourceActions.GetPrestationsSuccess({
              prestations: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'prestations',
              })
            );
            return of(
              resourceActions.GetPrestationsError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'prestations',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetMarques$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetMarques),
      switchMap(() =>
        this.resourcesService.getMarques().pipe(
          map((response: PaginatedApiResponse<IMarque>) =>
            resourceActions.GetMarquesSuccess({
              marques: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'marques',
              })
            );
            return of(
              resourceActions.GetMarquesError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'marques',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  SearchModeleByMarque$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.SearchModeleByMarque),
      switchMap((action) =>
        this.resourcesService.searchModeleByMarque(action.marque).pipe(
          map((modeles: IModele[]) =>
            resourceActions.SearchModeleByMarqueSuccess({
              modeles,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'modeles',
              })
            );
            return of(
              resourceActions.SearchModeleByMarqueError({
                error: {
                  ...iWsError,
                },
              })
            );
          })
        )
      )
    )
  );

  setcalledRessourcesSelectorEffect = createEffect(
    () =>
      this.store.pipe(
        select(resourceSelectors.CalledRessourcesSelector),
        map((calledRessources: ICalledRessources) => {
          const result = Object.entries(calledRessources).filter(
            (entrie: [string, boolean]) =>
              entrie[1] === false && entrie[0] !== 'calledAll'
          );
          if (result.length === 0 && !calledRessources.calledAll) {
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'calledAll',
                value: true,
              })
            );
          }
        })
      ),
    { dispatch: false }
  );

  GetTVAs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetTVAs),
      switchMap(() =>
        this.resourcesService.getTVAs().pipe(
          map((response: PaginatedApiResponse<ITva>) =>
            resourceActions.GetTVAsSuccess({
              tvas: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'tvas',
              })
            );
            return of(
              resourceActions.GetTVAsError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'tvas',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetFamillesIT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetFamillesIT),
      switchMap(() =>
        this.resourcesService.getFamillesIT().pipe(
          map((response: PaginatedApiResponse<IFamilleIT>) =>
            resourceActions.GetFamillesITSuccess({
              famillesIT: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'famillesIT',
              })
            );
            return of(
              resourceActions.GetFamillesITError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'famillesIT',
                value: true,
              })
            )
          )
        )
      )
    )
  );

  GetRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resourceActions.GetRoles),
      switchMap(() =>
        this.resourcesService.getRoles().pipe(
          map((response: PaginatedApiResponse<IRole>) =>
            resourceActions.GetRolesSuccess({
              roles: response.data,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.toastrService.error(
              this.translateService.instant('error.resources', {
                value: 'roles',
              })
            );
            return of(
              resourceActions.GetRolesError({
                error: {
                  ...iWsError,
                },
              })
            );
          }),
          finalize(() =>
            this.store.dispatch(
              resourceActions.SetCalledRessources({
                ressource: 'roles',
                value: true,
              })
            )
          )
        )
      )
    )
  );
}
