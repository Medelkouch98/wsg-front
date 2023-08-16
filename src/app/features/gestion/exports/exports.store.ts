import {
  ExportEtatRequest,
  IExportEtatRequest,
  IWsError,
  WsErrorClass,
} from '@app/models';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ExportEtatsService } from '@app/services';

export interface ExportsState {
  searchForm: IExportEtatRequest;
  errors?: IWsError;
}

export const initialExportsState: ExportsState = {
  searchForm: new ExportEtatRequest(),
  errors: null,
};

@Injectable()
export class ExportsStore extends ComponentStore<ExportsState> {
  constructor(
    private exportEtatsService: ExportEtatsService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private toasterService: ToastrService
  ) {
    super(initialExportsState);
  }

  searchForm$ = this.select((state: ExportsState) => state.searchForm);
  errors$ = this.select((state: ExportsState) => state.errors);

  //Updaters

  setSearchForm = (searchForm: IExportEtatRequest) =>
    this.patchState({ searchForm });
  resetSearchForm = () =>
    this.patchState({ searchForm: new ExportEtatRequest() });

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

  //Effects

  /**
   * exporter l'etat
   */
  exportEtat = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([_, exportEtatRequest]: [any, IExportEtatRequest]) => {
        return this.exportEtatsService.exportEtat(exportEtatRequest).pipe(
          tap(() => {
            this.toastrService.success(
              this.translateService.instant('gestion.exportEtats.exportInProgress')
            );
            this.resetSearchForm();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'searchError')
          )
        );
      })
    )
  );
}
