import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  IStatisticCardData,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import { ICartonLiasse, ILiasse, ITypeLiasse } from './models';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ImprimesService } from './services/imprimes.service';
import { SharedService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EtatImprimesEnum,
  ImprimesActionEnum,
  ImprimesExportTypeEnum,
} from './enum';
import { ToastrService } from 'ngx-toastr';
import { IImprimesForm } from './components/imprimes-form/models';
import {
  IImprimesSearchForm,
  ImprimesSearchForm,
} from './components/imprimes-search/imprimes-search-form/models';
import { Sort } from '@angular/material/sort';
import { exportFile } from '@app/helpers';

export interface ImprimesState {
  cartonsLiasses: PaginatedApiResponse<ICartonLiasse>;
  pageEvent: PageEvent;
  sort: Sort;
  imprimesSearchForm: ImprimesSearchForm;
  searchClicked: boolean;
  imprimesStatistics: IStatisticCardData[];
  typeLiasses: ITypeLiasse[];
  errors: IWsError;
}

export const initialImprimesState: ImprimesState = {
  cartonsLiasses: new PaginatedApiResponse<ICartonLiasse>(),
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  sort: { active: 'date_livraison', direction: 'desc' },
  imprimesSearchForm: new ImprimesSearchForm(),
  searchClicked: false,
  imprimesStatistics: [],
  typeLiasses: [],
  errors: null,
};

@Injectable()
export class ImprimesStore extends ComponentStore<ImprimesState> {
  cartonsLiasses$ = this.select((state: ImprimesState) => state.cartonsLiasses);
  cartonsLiassesData$ = this.select(
    (state: ImprimesState) => state.cartonsLiasses.data
  );
  pageEvent$ = this.select((state: ImprimesState) => state.pageEvent);
  sort$ = this.select((state: ImprimesState) => state.sort);
  imprimesSearchForm$ = this.select(
    (state: ImprimesState) => state.imprimesSearchForm
  );
  searchClicked$ = this.select((state: ImprimesState) => state.searchClicked);
  imprimesStatistics$ = this.select(
    (state: ImprimesState) => state.imprimesStatistics
  );
  typeLiasses$ = this.select((state: ImprimesState) => state.typeLiasses);

  constructor(
    private imprimesService: ImprimesService,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private toasterService: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(initialImprimesState);
  }

  // UPDATERS
  setImprimesSearchForm = this.updater(
    (state: ImprimesState, imprimesSearchForm: IImprimesSearchForm) => ({
      ...state,
      imprimesSearchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  setPageEvent = (pageEvent: PageEvent) =>
    this.patchState({
      pageEvent,
    });

  setSort = this.updater((state: ImprimesState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  setLiasses = this.updater(
    (
      state: ImprimesState,
      data: {
        liasses: PaginatedApiResponse<ILiasse>;
        cartonLiasseId: number;
        sort: Sort;
      }
    ) => ({
      ...state,
      cartonsLiasses: {
        ...state.cartonsLiasses,
        data: state.cartonsLiasses.data.map((row: ICartonLiasse) => {
          if (row.id === data.cartonLiasseId) {
            row.liassesSort = data.sort;
            row.liasses = data.liasses;
          }
          return row;
        }),
      },
    })
  );

  resetImprimesSearchForm = () =>
    this.patchState({
      imprimesSearchForm: new ImprimesSearchForm(),
    });

  setWsError = (errors: IWsError) =>
    this.patchState({
      errors,
    });

  // EFFECTS
  imprimesSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.sort$, this.imprimesSearchForm$, this.pageEvent$),
      switchMap(
        ([_, sort, searchForm, pageEvent]: [
          any,
          Sort,
          ImprimesSearchForm,
          PageEvent
        ]) => {
          const params = this.sharedService.getQuery(
            searchForm,
            pageEvent.pageIndex + 1,
            pageEvent.pageSize,
            sort
          );
          return this.imprimesService.getCartonsLiasses(params).pipe(
            tap((response: PaginatedApiResponse<ICartonLiasse>) => {
              this.patchState({
                cartonsLiasses: response,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.setWsError({
                ...iWsError,
                messageToShow: this.translateService.instant(
                  'qualite.imprimes.errorSearchImprimes'
                ),
              });
              return of(iWsError);
            })
          );
        }
      )
    )
  );

  getLiasses = this.effect(
    (
      data$: Observable<{
        cartonLiasseId: number;
        pageEvent?: PageEvent;
        sort?: Sort;
      }>
    ) =>
      data$.pipe(
        withLatestFrom(this.imprimesSearchForm$),
        switchMap(([data, searchForm]: [any, ImprimesSearchForm]) => {
          const params = this.sharedService.getQuery(
            {
              carton_liasse_id: data.cartonLiasseId,
              ...(searchForm.etat && {
                etat: searchForm.etat,
              }),
              ...(searchForm.numero_liasse && {
                numero_liasse: searchForm.numero_liasse,
              }),
            },
            data.pageEvent?.pageIndex + 1 || 1,
            data.pageEvent?.pageSize || DEFAULT_PAGE_SIZE,
            data.sort
          );

          return this.imprimesService.getLiasses(params).pipe(
            tap((liasses: PaginatedApiResponse<ILiasse>) => {
              // modifier le tableau des liasses qui se trouve dans cartonliasse  pour le carton concerné.
              this.setLiasses({
                liasses,
                cartonLiasseId: data.cartonLiasseId,
                sort: data.sort,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.setWsError({
                ...iWsError,
                messageToShow: this.translateService.instant(
                  'qualite.imprimes.errorGetImprimes'
                ),
              });
              return of(iWsError);
            })
          );
        })
      )
  );

  imprimesStatistics = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.imprimesService.imprimesStatistics().pipe(
          tap((totaux: { [key: string]: number }) => {
            this.patchState({
              imprimesStatistics: [
                {
                  class: 'bg-sky-600',
                  value: totaux['Imprimés réglementaires'],
                  label: 'qualite.imprimes.statistics.ImprimesReglementaires',
                },
                {
                  class: 'bg-indigo-600',
                  value: totaux['liasses_ouvertes'],
                  label: 'qualite.imprimes.statistics.liassesOuvertes',
                },
              ],
            });
          }),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            this.setWsError({
              ...iWsError,
              messageToShow: this.translateService.instant(
                'qualite.imprimes.errorStatisticsImprimes'
              ),
            });
            return of(iWsError);
          })
        )
      )
    )
  );

  goToFicheControle = this.effect((idControle$: Observable<number>) =>
    idControle$.pipe(
      tap((idcontrole: number) =>
        this.router.navigate(['/p/activity/fiche', idcontrole])
      )
    )
  );

  goToCancelOrPretImp = this.effect((navigateTo$: Observable<string>) =>
    navigateTo$.pipe(
      tap((navigateTo: string) =>
        this.router.navigate([navigateTo], { relativeTo: this.route })
      )
    )
  );

  goToLiasses = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['p/qualite/liasse'])))
  );

  getTypeLiasses = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.imprimesService
          .typeLiasses({ type: EtatImprimesEnum.annuleDetruit })
          .pipe(
            tap((typeLiasses: ITypeLiasse[]) =>
              this.patchState({ typeLiasses })
            ),
            catchError((error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.setWsError({
                ...iWsError,
                messageToShow: this.translateService.instant(
                  'qualite.imprimes.errors.errorTypeLiasses'
                ),
              });
              return of(iWsError);
            })
          )
      )
    )
  );

  save = this.effect(
    (
      params$: Observable<{
        imprimesForm: IImprimesForm;
        actionType: ImprimesActionEnum;
      }>
    ) =>
      params$.pipe(
        switchMap((params) =>
          this.imprimesService
            .save(params.imprimesForm, params.actionType)
            .pipe(
              tap(() => {
                this.toasterService.success(
                  this.translateService.instant('commun.operationTerminee')
                );
                this.goToLiasses();
              }),
              catchError((errorResponse: HttpErrorResponse) => {
                const firstErrorKey =
                  errorResponse.error?.errors &&
                  Object.keys(errorResponse.error.errors)[0];
                const messageToShow =
                  (firstErrorKey &&
                    errorResponse.error?.errors[firstErrorKey][0]) ||
                  this.translateService.instant(
                    'qualite.imprimes.errors.errorCancelLiasses'
                  );
                const iWsError: IWsError = new WsErrorClass(errorResponse);
                this.setWsError({
                  ...iWsError,
                  messageToShow,
                });
                this.toasterService.warning(messageToShow);
                return of(iWsError);
              })
            )
        )
      )
  );

  export = this.effect((typeExport$: Observable<ImprimesExportTypeEnum>) =>
    typeExport$.pipe(
      switchMap((typeExport: ImprimesExportTypeEnum) =>
        this.imprimesService.export(typeExport).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) => {
            const messageToShow =
              this.translateService.instant('error.getFileError');
            const iWsError: IWsError = new WsErrorClass(error);
            this.setWsError({
              ...iWsError,
              messageToShow,
            });
            this.toasterService.error(messageToShow);
            return of(error);
          })
        )
      )
    )
  );
}
