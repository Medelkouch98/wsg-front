import { IWsError } from '@app/models';
import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { SharedService } from '@app/services';
import { ExportSapTuvRequest, IExportSapTuvRequest } from './models';
import { ExportSapTuvService } from './services/export-sap-tuv.service';

export interface ExportSapTuvState {
  searchForm: IExportSapTuvRequest;
  errors?: IWsError;
}

export const initialExportSapTuvState: ExportSapTuvState = {
  searchForm: new ExportSapTuvRequest(),
  errors: null,
};

@Injectable()
export class ExportSapTuvStore extends ComponentStore<ExportSapTuvState> {
  private exportSapTuvService = inject(ExportSapTuvService);
  private translateService = inject(TranslateService);
  private toastr = inject(ToastrService);
  private sharedService = inject(SharedService);

  constructor() {
    super(initialExportSapTuvState);
  }

  searchForm$ = this.select((state: ExportSapTuvState) => state.searchForm);
  errors$ = this.select((state: ExportSapTuvState) => state.errors);

  // ========== Updaters ==========
  setSearchForm = (searchForm: IExportSapTuvRequest) =>
    this.patchState({ searchForm });
  resetSearchForm = () =>
    this.patchState({ searchForm: new ExportSapTuvRequest() });

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = true
  ) => {
    this.patchState({
      errors: this.sharedService.getWsError(
        error,
        `gestion.exportSapTuv.${errorMessage}`,
        showToaster
      ),
    });
    return of(error);
  };

  // ========== Effects ==========

  public exportSapTuv = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([_, exportRequest]: [void, IExportSapTuvRequest]) => {
        const query = this.sharedService.getSearchQuery(exportRequest);
        return this.exportSapTuvService.exportSapTuv(query).pipe(
          tap(() => {
            this.toastr.success(
              this.translateService.instant(
                'gestion.exportSapTuv.exportSuccess'
              )
            );
            this.resetSearchForm();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportError')
          )
        );
      })
    )
  );
}
