import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  IAuditAnomalie,
  IAuditAnomalieFile,
  IAudits,
  ITypeAudit,
} from './models';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuditService } from './services/audit.service';
import { SharedService } from '@app/services';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { IWsError, PaginatedApiResponse, WsErrorClass } from '@app/models';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import {
  AuditSearchForm,
  IAuditSearchForm,
} from './components/audit-search/audit-search-form/models';
import { Sort } from '@angular/material/sort';

export interface AuditState {
  audits: PaginatedApiResponse<IAudits>;
  typesAudit: ITypeAudit[];
  auditSearchForm: IAuditSearchForm;
  sort: Sort;
  searchClicked: boolean;
  pageEvent: PageEvent;
  errors: IWsError;
}

export const initialAuditState: AuditState = {
  audits: new PaginatedApiResponse<IAudits>(),
  typesAudit: [],
  auditSearchForm: new AuditSearchForm(),
  sort: { active: 'date_audit', direction: 'desc' },
  searchClicked: false,
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  errors: null,
};
@Injectable()
export class AuditStore extends ComponentStore<AuditState> {
  typesAudit$ = this.select((state: AuditState) => state.typesAudit);
  audits$ = this.select((state: AuditState) => state.audits);
  searchForm$ = this.select((state: AuditState) => state.auditSearchForm);
  sort$ = this.select((state: AuditState) => state.sort);
  searchClicked$ = this.select((state: AuditState) => state.searchClicked);
  pageEvent$ = this.select((state: AuditState) => state.pageEvent);
  constructor(
    private auditService: AuditService,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private toaster: ToastrService
  ) {
    super(initialAuditState);
  }

  // UPDATERS

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'qualite.audit.errors.' + errorMessage
    );
    this.patchState({
      errors: {
        ...iWsError,
        messageToShow,
      },
    });
    showToaster ? this.toaster.error(messageToShow) : '';
    return of(error);
  };

  setAuditSearchForm = this.updater(
    (state: AuditState, auditSearchForm: IAuditSearchForm) => ({
      ...state,
      auditSearchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  setPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  setSort = this.updater((state: AuditState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  resetAuditSearchForm = () =>
    this.patchState({
      auditSearchForm: new AuditSearchForm(),
    });

  setAuditAnomalies = this.updater(
    (state: AuditState, anomalie: IAuditAnomalie) => ({
      ...state,
      audits: {
        ...state.audits,
        data: state.audits.data.map((row: IAudits) => {
          const index = row.anomalies.findIndex(
            (anomaly: IAuditAnomalie) => anomaly.id === anomalie.id
          );
          row.anomalies = [
            ...row.anomalies.map((element: IAuditAnomalie, i: number) =>
              i === index ? anomalie : element
            ),
          ];
          return row;
        }),
      },
    })
  );

  deleteFileAnomalie = this.updater((state: AuditState, idFile: number) => ({
    ...state,
    audits: {
      ...state.audits,
      data: state.audits.data.map((row: IAudits) => {
        row.anomalies = [
          ...row.anomalies.map((el: IAuditAnomalie) => {
            el.fichiers = el.fichiers.filter(
              (file: IAuditAnomalieFile) => file.id !== idFile
            );
            return el;
          }),
        ];
        return row;
      }),
    },
  }));

  // EFFECTS
  searchAudits = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.sort$, this.searchForm$, this.pageEvent$),
      switchMap(
        ([_, sort, searchForm, pageEvent]: [
          any,
          Sort,
          IAuditSearchForm,
          PageEvent
        ]) => {
          const params = this.sharedService.getQuery(
            searchForm,
            pageEvent.pageIndex + 1,
            pageEvent.pageSize,
            sort
          );
          return this.auditService.getAudits(params).pipe(
            tap((audits: PaginatedApiResponse<IAudits>) => {
              this.patchState({
                audits,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'searchAuditsError')
            )
          );
        }
      )
    )
  );

  getAuditTypes = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return this.auditService.getAuditTypes().pipe(
          tap((typesAudit: ITypeAudit[]) => {
            this.patchState({
              typesAudit,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getTypeAuditError')
          )
        );
      })
    )
  );

  updateAuditAnomalie = this.effect(
    (
      auditAnomalie$: Observable<{
        idAnomalie: number;
        data: { [key: string]: string };
      }>
    ) =>
      auditAnomalie$.pipe(
        switchMap((auditAnomalie) =>
          this.auditService
            .updateAuditAnomalie(auditAnomalie.idAnomalie, auditAnomalie.data)
            .pipe(
              tap((anomalie: IAuditAnomalie) => {
                this.setAuditAnomalies(anomalie);
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'updateAnomalieError', true)
              )
            )
        )
      )
  );

  addFile = this.effect((formData$: Observable<FormData>) =>
    formData$.pipe(
      switchMap((formData: FormData) =>
        this.auditService.addFile(formData).pipe(
          tap((anomalie: IAuditAnomalie) => {
            this.setAuditAnomalies(anomalie);
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'addAnomalieFileError', true)
          )
        )
      )
    )
  );

  getFile = this.effect((file$: Observable<IAuditAnomalieFile>) =>
    file$.pipe(
      switchMap((file: IAuditAnomalieFile) =>
        this.auditService.getFile(file.id).pipe(
          tap((blob: Blob) =>
            FileSaver.saveAs(
              blob,
              file.fichier.slice(file.fichier.indexOf('-') + 1)
            )
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getAnomalieFileError', true)
          )
        )
      )
    )
  );

  deleteFile = this.effect((idFile$: Observable<number>) =>
    idFile$.pipe(
      switchMap((idFile: number) =>
        this.auditService.deleteFile(idFile).pipe(
          tap(() => {
            this.deleteFileAnomalie(idFile);
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteAnomalieFileError', true)
          )
        )
      )
    )
  );
}
