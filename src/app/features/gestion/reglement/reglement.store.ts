import { IWsError, PaginatedApiResponse, WsErrorClass } from '@app/models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ReglementService } from './services/reglement.service';
import {
  IReglement,
  IReglementRequest,
  ISearchCriteria,
  Reglement,
  SearchCriteria,
} from './models';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment';
import { exportFile } from '@app/helpers';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { AppState } from '../../../core/store/app.state';
import { SharedService } from '@app/services';

export interface ReglementsState {
  reglementsList: PaginatedApiResponse<IReglement>;
  searchClicked: boolean;
  searchForm: ISearchCriteria;
  sort: Sort;
  pageEvent: PageEvent;
  reglement: IReglement;
  errors?: IWsError;
}

export const initialReglementsState: ReglementsState = {
  reglementsList: null,
  searchClicked: false,
  searchForm: new SearchCriteria(),
  sort: { active: 'date_reglement', direction: 'desc' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  reglement: new Reglement(),
  errors: null,
};

@Injectable()
export class ReglementStore extends ComponentStore<ReglementsState> {
  constructor(
    private reglementService: ReglementService,
    private translateService: TranslateService,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private toasterService: ToastrService
  ) {
    super(initialReglementsState);
  }

  //Selectors

  reglementsList$ = this.select((state: ReglementsState) => state.reglementsList);

  searchForm$ = this.select((state: ReglementsState) => state.searchForm);

  sort$ = this.select((state: ReglementsState) => state.sort);

  pageEvent$ = this.select((state: ReglementsState) => state.pageEvent);

  searchClicked$ = this.select((state: ReglementsState) => state.searchClicked);

  reglement$ = this.select((state: ReglementsState) => state.reglement);

  errors$ = this.select((state: ReglementsState) => state.errors);

  //Updaters

  /**
   * gestion des messages d'erreur
   * @param {HttpErrorResponse} error
   * @param {string} errorMessage
   * @param {boolean} showToaster
   * @return {Observable<HttpErrorResponse>}
   */
  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'gestion.errors.' + errorMessage
    );

    this.patchState({
      errors: {
        ...iWsError,
        messageToShow,
      },
    });
    if (showToaster) {
      this.toasterService.error(messageToShow);
    }
    return of(error);
  };

  setSort = this.updater((state: ReglementsState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  setPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  setSearchForm = this.updater(
    (state: ReglementsState, searchForm: ISearchCriteria) => ({
      ...state,
      searchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
      selectedReglements: [],
    })
  );

  resetSearchForm = () => this.patchState({ searchForm: new SearchCriteria() });

  initialiseReglement = () =>
    this.patchState({
      reglement: new Reglement(),
    });

  //EFFECTS

  /**
   * chercher les règlements
   */
  reglementSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$, this.sort$, this.pageEvent$),
      switchMap(
        ([_, searchForm, sort, pageEvent]: [
          any,
          ISearchCriteria,
          Sort,
          PageEvent
        ]) => {
          const data: ISearchCriteria =
            this.formatDateInSearchCriteria(searchForm);
          return this.reglementService
            .searchReglement(
              data,
              sort,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize
            )
            .pipe(
              tap((reglementsList: PaginatedApiResponse<IReglement>) => {
                this.patchState({ reglementsList });
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'searchError')
              )
            );
        }
      )
    )
  );

  /**
   * récupérer les details du reglement
   */
  getReglement = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.reglementService.getReglement(params['idReglement']).pipe(
          tap((reglement: IReglement) => {
            this.patchState({ reglement });
          }),
          catchError((error: HttpErrorResponse) => {
            this.goToReglements();
            return this.setWsError(error, 'reglementDetails');
          })
        )
      )
    )
  );

  /**
   * ajouter un reglement
   */
  addReglement = this.effect(
    (reglementRequest$: Observable<IReglementRequest>) => {
      return reglementRequest$.pipe(
        switchMap((reglementRequest: IReglementRequest) => {
          reglementRequest.date_reglement = reglementRequest.date_reglement
            ? moment(
                reglementRequest.date_reglement,
                'YYYY-MM-DD HH:mm:ss'
              ).format('YYYY-MM-DD HH:mm:ss')
            : null;
          return this.reglementService.addReglement(reglementRequest).pipe(
            tap(() => {
              this.toasterService.success(
                this.translateService.instant('commun.operationTerminee')
              );
              //On relance la recherche
              this.reglementSearch();
              //Puis on redirige l'utilisateur vers l'interface recherche
              this.goToReglements();
            }),
            catchError((error: HttpErrorResponse) => {
              return this.setWsError(error, 'addReglementError');
            })
          );
        })
      );
    }
  );

  /**
   * modifier un règlement
   */
  updateReglement = this.effect(
    (
      trigger$: Observable<{
        id: number;
        data: { [key: string]: any };
      }>
    ) => {
      return trigger$.pipe(
        switchMap((trigger: { data: { [key: string]: any }; id: number }) => {
          if (!!trigger.data?.date_reglement) {
            trigger.data.date_reglement = trigger.data.date_reglement
              ? moment(
                  trigger.data.date_reglement,
                  'YYYY-MM-DD HH:mm:ss'
                ).format('YYYY-MM-DD HH:mm:ss')
              : null;
          }
          return this.reglementService
            .updateReglement(trigger.id, trigger.data)
            .pipe(
              tapResponse(
                (response: IReglement) => {
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                  this.goToReglementsDetails(response.id);
                },
                (error: HttpErrorResponse) =>
                  this.setWsError(error, 'updateReglementError', true)
              )
            );
        })
      );
    }
  );

  /**
   * supprimer un règlement
   */
  deleteReglement = this.effect((reglementId$: Observable<number>) =>
    reglementId$.pipe(
      switchMap((reglementId: number) =>
        this.reglementService.deleteReglement(reglementId).pipe(
          tap(() => {
            this.toasterService.success(
              this.translateService.instant('commun.operationTerminee')
            );
            //On relance la recherche
            this.reglementSearch();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteReglementError')
          )
        )
      )
    )
  );

  /**
   * Exporter les règlements en PDF
   */
  exportReglementsPDF = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([_, searchForm]: [any, ISearchCriteria]) => {
        const data: ISearchCriteria =
          this.formatDateInSearchCriteria(searchForm);
        return this.reglementService.exportReglementsPDF(data).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportReglementsPDF')
          )
        );
      })
    )
  );
  /**
   * Exporter les règlements en XLS
   */
  exportReglementsXLS = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([_, searchForm]: [any, ISearchCriteria]) => {
        const data: ISearchCriteria =
          this.formatDateInSearchCriteria(searchForm);
        return this.reglementService.exportReglementsXLS(data).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportReglementsPDF')
          )
        );
      })
    )
  );

  /**
   * rediriger l'utilisateur vers la page d'ajout de règlement
   */
  goToAddReglement = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => this.router.navigate(['add'], { relativeTo: this.route }))
    )
  );

  /**
   * rediriger l'utilisateur vers la page de modification/aperçu de règlement
   */
  goToReglementsDetails = this.effect((id$: Observable<number>) =>
    id$.pipe(
      tap((id: number) =>
        this.router.navigate([id], {
          relativeTo: this.route,
        })
      )
    )
  );

  /**
   * rediriger l'utilisateur vers la page de recherche de règlement
   */
  goToReglements = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['/p/gestion/reglements'])))
  );

  /**
   * formatter la date pour l'envoi en paramètre de recherche
   * @param {ISearchCriteria} searchForm
   * @return {ISearchCriteria}
   * @private
   */
  private formatDateInSearchCriteria(
    searchForm: ISearchCriteria
  ): ISearchCriteria {
    return {
      ...searchForm,
      date_reglement_start: searchForm.date_reglement_start
        ? moment(searchForm.date_reglement_start, 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        : null,
      date_reglement_end: searchForm.date_reglement_end
        ? moment(searchForm.date_reglement_end, 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        : null,
    };
  }
}
