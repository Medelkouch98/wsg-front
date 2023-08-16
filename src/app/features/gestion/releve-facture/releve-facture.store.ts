import { IWsError, PaginatedApiResponse, WsErrorClass } from '@app/models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { ReleveFactureService } from './services/releve-facture.service';
import {
  IReleveFacture,
  IReleveFactureExportRequestDetails,
  ISearchCriteria,
  ReleveFactureExportRequest,
  SearchCriteria,
} from './models';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment';
import { exportFile } from '@app/helpers';

export interface ReleveFactureState {
  releveFactures: PaginatedApiResponse<IReleveFacture>;
  selectedReleveFactures: IReleveFactureExportRequestDetails[]; //use the type that gets sent, on select, set client id
  searchClicked: boolean;
  searchForm: ISearchCriteria;
  sort: Sort;
  pageEvent: PageEvent;
  errors?: IWsError;
}

export const initialReleveFactureState: ReleveFactureState = {
  releveFactures: null,
  selectedReleveFactures: [],
  searchClicked: false,
  searchForm: new SearchCriteria(),
  sort: { active: 'nom', direction: 'asc' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  errors: null,
};

@Injectable()
export class ReleveFactureStore extends ComponentStore<ReleveFactureState> {
  constructor(
    private releveFactureService: ReleveFactureService,
    private translateService: TranslateService,
    private toasterService: ToastrService
  ) {
    super(initialReleveFactureState);
  }

  //Selectors

  releveFactures$ = this.select(
    (state: ReleveFactureState) => state.releveFactures
  );
  searchForm$ = this.select((state: ReleveFactureState) => state.searchForm);

  sort$ = this.select((state: ReleveFactureState) => state.sort);
  selectedReleveFactures$ = this.select(
    (state: ReleveFactureState) => state.selectedReleveFactures
  );

  pageEvent$ = this.select((state: ReleveFactureState) => state.pageEvent);

  searchClicked$ = this.select(
    (state: ReleveFactureState) => state.searchClicked
  );

  errors$ = this.select((state: ReleveFactureState) => state.errors);

  //Updaters

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'gestion.errors' + errorMessage
    );
    this.patchState({
      errors: {
        ...iWsError,
        messageToShow,
      },
    });
    showToaster ? this.toasterService.error(messageToShow) : '';
    return of(error);
  };

  selectReleveFacture = this.updater(
    (
      state: ReleveFactureState,
      releveFacture: IReleveFactureExportRequestDetails
    ) => {
      return {
        ...state,
        selectedReleveFactures: [
          ...state.selectedReleveFactures.filter(
            (s: IReleveFactureExportRequestDetails) =>
              s.client_id !== releveFacture.client_id
          ),
          releveFacture,
        ],
      };
    }
  );

  unselectReleveFacture = this.updater(
    (
      state: ReleveFactureState,
      releveFacture: IReleveFactureExportRequestDetails
    ) => ({
      ...state,
      selectedReleveFactures: [
        ...state.selectedReleveFactures.filter(
          (s: IReleveFactureExportRequestDetails) =>
            releveFacture.client_id !== s.client_id
        ),
      ],
    })
  );

  toggleEmail = this.updater((state: ReleveFactureState, clientId: number) => {
    return {
      ...state,
      selectedReleveFactures: [
        ...state.selectedReleveFactures.map(
          (s: IReleveFactureExportRequestDetails) => {
            if (s.client_id === clientId) {
              s.sendMail = !s.sendMail;
            }
            return s;
          }
        ),
      ],
    };
  });

  setSort = this.updater((state: ReleveFactureState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  setPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  setSearchForm = this.updater(
    (state: ReleveFactureState, searchForm: ISearchCriteria) => ({
      ...state,
      searchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
      selectedReleveFactures: [],
    })
  );
  resetSearchForm = () => this.patchState({ searchForm: new SearchCriteria() });
  //EFFECTS

  releveFactureSearch = this.effect((trigger$) =>
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
          return this.releveFactureService
            .searchReleveFacture(
              data,
              sort,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize
            )
            .pipe(
              tap((releveFactures: PaginatedApiResponse<IReleveFacture>) => {
                this.patchState({ releveFactures });
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'searchError')
              )
            );
        }
      )
    )
  );

  //Exporter le relevé de factures en PDF
  ExportReleveFactures = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$, this.selectedReleveFactures$),
      switchMap(
        ([_, searchForm, selectedReleveFactures]: [
          any,
          ISearchCriteria,
          IReleveFactureExportRequestDetails[]
        ]) => {
          const data: ISearchCriteria =
            this.formatDateInSearchCriteria(searchForm);
          return this.releveFactureService
            .exportReleveFactures(
              new ReleveFactureExportRequest(selectedReleveFactures),
              data
            )
            .pipe(
              tap((resp: HttpResponse<Blob>) => exportFile(resp)),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'editionReleve')
              )
            );
        }
      )
    )
  );

  private formatDateInSearchCriteria(
    searchForm: ISearchCriteria
  ): ISearchCriteria {
    return {
      ...searchForm,
      start_date: searchForm.start_date
        ? moment(searchForm.start_date, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
      end_date: searchForm.end_date
        ? moment(searchForm.end_date, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
    };
  }
}
