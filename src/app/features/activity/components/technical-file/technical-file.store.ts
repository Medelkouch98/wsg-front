import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TechnicalFileService } from '../../services/technical-file.service';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.state';
import * as RouterSelector from '../../../../core/store/router/router.selector';
import {
  catchError,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  ControlFiche,
  IControlFiche,
  IControlFicheResponse,
} from '../../models';
import { TechnicalFileTypeEnum } from '@app/enums';
import { GlobalHelper } from '@app/helpers';
import { IActionsButton, IWsError, WsErrorClass } from '@app/models';
import { HttpErrorResponse } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { SharedService } from '@app/services';

export interface TechnicalFileState {
  control: IControlFiche;
  filePdfMap: Map<TechnicalFileTypeEnum, string>;
  selectedTabIndex: number;
  buttons: IActionsButton[];
  errors: IWsError;
}

export const initialTechnicalFileState: TechnicalFileState = {
  control: null,
  filePdfMap: new Map(),
  selectedTabIndex: 0,
  buttons: [],
  errors: null,
};

@Injectable()
export class TechnicalFileStore extends ComponentStore<TechnicalFileState> {
  // SELECTORS
  control$ = this.select((state) => state.control);
  filePdfMap$ = this.select((state) => state.filePdfMap);
  selectedTabIndex$ = this.select((state) => state.selectedTabIndex);
  filePdfByFileType$ = (fileType: TechnicalFileTypeEnum) =>
    this.select((state) => state.filePdfMap.get(fileType));
  buttons$ = this.select((state) => state.buttons);

  constructor(
    private technicalFileService: TechnicalFileService,
    private store: Store<AppState>,
    private toasterService: ToastrService,
    private translateService: TranslateService,
    private router: Router,
    private sharedService: SharedService
  ) {
    super(initialTechnicalFileState);
  }

  // UPDATERS
  SetFileUrl = this.updater((state: TechnicalFileState, fileUrl: string) => {
    return { ...state, fileUrl };
  });

  SetButtons = this.updater(
    (state: TechnicalFileState, buttons: IActionsButton[]) => {
      return { ...state, buttons };
    }
  );

  SetSelectedTabIndex = this.updater(
    (state: TechnicalFileState, selectedTabIndex: number) => {
      return { ...state, selectedTabIndex };
    }
  );

  SetWsError = this.updater((state: TechnicalFileState, errors: IWsError) => ({
    ...state,
    errors,
  }));

  // EFFECTS

  /**
   * Récupérer le résumer du contrôle
   */
  GetControl = this.effect((trigger$) => {
    return trigger$.pipe(
      withLatestFrom(
        this.store.pipe(select(RouterSelector.RouterParamsSelector))
      ),
      switchMap(([_, params]: [any, Params]) =>
        this.technicalFileService.getControl(params.idControl).pipe(
          tapResponse(
            (control: IControlFicheResponse) => {
              if (control) {
                this.patchState({
                  control: new ControlFiche(
                    GlobalHelper.flattenObject(control)
                  ),
                });
              } else {
                this.router.navigate(['/p/activity']);
                this.toasterService.warning(
                  this.translateService.instant('error.controlNotExist')
                );
              }
            },
            () => {
              this.router.navigate(['/p/activity']);
              this.toasterService.error(
                this.translateService.instant('error.getControlError')
              );
            }
          )
        )
      )
    );
  });

  GetPdf = this.effect((fileType$: Observable<TechnicalFileTypeEnum>) => {
    return fileType$.pipe(
      withLatestFrom(this.control$, this.filePdfMap$),
      filter(
        ([fileType, _, filePdf]: [
          TechnicalFileTypeEnum,
          IControlFiche,
          Map<TechnicalFileTypeEnum, string>
        ]) => !filePdf.get(fileType)
      ),
      switchMap(
        ([fileType, control, filePdf]: [
          TechnicalFileTypeEnum,
          IControlFiche,
          Map<TechnicalFileTypeEnum, string>
        ]) => {
          const query = `${fileType}/${control.id}`;
          return this.technicalFileService.getPdf(query).pipe(
            tap((response: Blob) => {
              const pdf = new Blob([response], {
                type: 'application/pdf',
              });
              const pdfFile =
                filePdf.size === 0
                  ? new Map<TechnicalFileTypeEnum, string>()
                  : filePdf;
              this.patchState({
                filePdfMap: pdfFile.set(fileType, URL.createObjectURL(pdf)),
              });
            }),
            catchError((error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.SetWsError({
                ...iWsError,
                messageToShow:
                  this.translateService.instant('error.getFileError'),
              });
              return of(iWsError);
            })
          );
        }
      )
    );
  });

  DownloadPVAndAttestationPassage = this.effect(
    (numeroPV$: Observable<number>) =>
      numeroPV$.pipe(
        withLatestFrom(
          this.store.pipe(select(RouterSelector.RouterParamsSelector))
        ),
        switchMap(([numPv, params]: [number, Params]) =>
          this.technicalFileService
            .getAttestationPassage(params.idControl)
            .pipe(
              tap((blob: Blob) => {
                FileSaver.saveAs(blob, `ATT_${numPv}`);
              }),
              switchMap(() =>
                this.technicalFileService
                  .getPdf(`${TechnicalFileTypeEnum.PV}/${params.idControl}`)
                  .pipe(
                    tap((blob: Blob) => {
                      FileSaver.saveAs(blob, `PV_${numPv}`);
                    }),
                    catchError((error: HttpErrorResponse) => {
                      const messageToShow =
                        this.translateService.instant('error.getFileError');
                      const iWsError: IWsError = new WsErrorClass(error);
                      this.SetWsError({
                        ...iWsError,
                        messageToShow,
                      });
                      this.toasterService.error(messageToShow);
                      return of(error);
                    })
                  )
              ),
              catchError((error: HttpErrorResponse) => {
                const messageToShow =
                  this.translateService.instant('error.getFileError');
                const iWsError: IWsError = new WsErrorClass(error);
                this.SetWsError({
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

  GoToClient = this.effect((idclient$: Observable<number>) =>
    idclient$.pipe(
      tap((idclient: number) => {
        this.sharedService.redirectToNewTab(['/p/commercial/client', idclient]);
      })
    )
  );

  GoToAdvancedSearch = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.router.navigate(['/p/activity/search']);
      })
    )
  );
}
