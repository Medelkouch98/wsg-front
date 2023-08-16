import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  IActionsButton,
  IControleur,
  IStatisticCardData,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import { CompteursService } from './services/compteurs.service';
import {
  IAttachment,
  ICompteurAddActionData,
  ICompteurItem,
  ICompteursSearchResponse,
  IDocumentUploadData,
  IEditJustificationData,
  IJustificationsResponse,
  IJustifieForAllData,
  ISearchCriteria,
  SearchCriteria,
} from './models';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  CompteursHelper,
  ImpressionCompteursPDFButton,
} from './helpers/compteurs.helper';
import { exportFile } from '@app/helpers';
import { UsersService } from '../../settings/users/services/users.service';

export interface CompteursState {
  compteurs: Record<number, Record<string, ICompteurItem[]>>;
  isCompteursIntegres: number;
  searchCriteria: ISearchCriteria;
  searchClicked: boolean;
  statistics: IStatisticCardData[];
  justifications: IJustificationsResponse[];
  displayCheckCompteur: boolean;
  actionsButtons: IActionsButton[];
  controleurs: IControleur[];
  errors?: IWsError;
}

export const initialCompteursState: CompteursState = {
  compteurs: null,
  isCompteursIntegres: null,
  searchCriteria: new SearchCriteria(),
  searchClicked: false,
  statistics: [],
  justifications: [],
  displayCheckCompteur: false,
  actionsButtons: [],
  controleurs: [],
  errors: null,
};

@Injectable()
export class CompteursStore extends ComponentStore<CompteursState> {
  constructor(
    private compteursService: CompteursService,
    private translateService: TranslateService,
    private toasterService: ToastrService,
    private compteursHelper: CompteursHelper,
    private usersService: UsersService
  ) {
    super(initialCompteursState);
  }

  //SELECTORS
  SearchCriteriaSelector$ = this.select(
    (state: CompteursState) => state.searchCriteria
  );
  SearchClickedSelector$ = this.select(
    (state: CompteursState) => state.searchClicked
  );

  IsCompteursIntegresSelector$ = this.select(
    (state: CompteursState) => state.isCompteursIntegres
  );

  CompteursSelector$ = this.select((state: CompteursState) => state.compteurs);

  StatisticsSelector$ = this.select(
    (state: CompteursState) => state.statistics
  );

  JustificationsSelector$ = this.select(
    (state: CompteursState) => state.justifications
  );

  DisplayCheckCompteurSelector$ = this.select(
    (state: CompteursState) => state.displayCheckCompteur
  );
  ActionsButtonsSelector$ = this.select(
    (state: CompteursState) => state.actionsButtons
  );
  ControleursSelector$ = this.select(
    (state: CompteursState) => state.controleurs
  );

  //UPDATERS
  SetCompteursSearchCriteria = this.updater(
    (state: CompteursState, searchCriteria: ISearchCriteria) => ({
      ...state,
      searchCriteria,
      searchClicked: true,
    })
  );

  SetStatistics = (statistics: IStatisticCardData[]) =>
    this.patchState({ statistics });

  SetIsCompteursIntegres = (isCompteursIntegres: number) =>
    this.patchState({ isCompteursIntegres });

  ResetSearchCriteria = () =>
    this.patchState({ searchCriteria: new SearchCriteria() });

  SetCompteurs = (compteurs: Record<number, Record<string, ICompteurItem[]>>) =>
    this.patchState({ compteurs });

  SetJustifications = (justifications: IJustificationsResponse[]) =>
    this.patchState({ justifications: justifications });

  SetDisplayCheckCompteur = (displayCheckCompteur: boolean) =>
    this.patchState({ displayCheckCompteur });

  SetActionsButtons = (actionsButtons: IActionsButton[]) =>
    this.patchState({ actionsButtons });

  SetControleurs = (controleurs: IControleur[]) =>
    this.patchState({ controleurs });

  /**
   * gestion d'erreur
   * @param {HttpErrorResponse} error
   * @param {string} errorMessage
   * @param {boolean} showToaster
   * @returns {Observable<HttpErrorResponse>}
   */
  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'qualite.compteurs.errors.' + errorMessage
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

  //EFFECTS

  //Recherche de compteurs
  CompteursSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.SearchCriteriaSelector$,
        this.ActionsButtonsSelector$
      ),
      switchMap(
        ([_, searchCriteria, actionsButtons]: [
          void,
          ISearchCriteria,
          IActionsButton[]
        ]) => {
          return this.compteursService.searchCompteurs(searchCriteria).pipe(
            tap((response: ICompteursSearchResponse) => {
              this.SetCompteurs(
                this.compteursHelper.mapCompteursSearchResult(response)
              );
              this.SetIsCompteursIntegres(response.integrated);
              this.SetDisplayCheckCompteur(
                !!response.stats?.niveau1?.unjustified &&
                  searchCriteria.month !== 1
              );
              this.SetStatistics(
                this.compteursHelper.generateStatisticCardDataFromCompteursStats(
                  response.stats
                )
              );
              const hasCompteurs =
                Object.entries(response.compteurs).length > 0;

              const hasImpressionButton = actionsButtons.some(
                (button: IActionsButton) =>
                  button.action === 'impressionCompteursPDF'
              );
              if (hasCompteurs && !hasImpressionButton) {
                this.SetActionsButtons([
                  ImpressionCompteursPDFButton,
                  ...actionsButtons,
                ]);
              } else if (!hasCompteurs && hasImpressionButton) {
                this.SetActionsButtons(
                  actionsButtons.filter(
                    (button: IActionsButton) =>
                      button.action !== 'impressionCompteursPDF'
                  )
                );
              }
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'searchCompteurs')
            )
          );
        }
      )
    )
  );

  //Recuperer les details de justification
  GetCompteurJustifications = this.effect((codeCompteur$: Observable<string>) =>
    codeCompteur$.pipe(
      switchMap((codeCompteur: string) => {
        return this.compteursService.getJustifications(codeCompteur).pipe(
          tap((response: IJustificationsResponse[]) => {
            this.SetJustifications(response);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getCompteurJustificationsResponse')
          )
        );
      })
    )
  );

  //Ajouter une justification et une action à tous les controles
  JustifieAll = this.effect((addData$: Observable<IJustifieForAllData>) => {
    return addData$.pipe(
      withLatestFrom(this.SearchCriteriaSelector$),
      switchMap(
        ([addData, searchCriteria]: [IJustifieForAllData, ISearchCriteria]) => {
          return this.compteursService
            .justifieAll(addData, searchCriteria.year, searchCriteria.month)
            .pipe(
              tap(() => {
                this.toasterService.success(
                  this.translateService.instant('commun.operationTerminee')
                );
                //on relance la recherche pour réinitialiser les données
                this.CompteursSearch();
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'addJustificationForAllControles')
              )
            );
        }
      )
    );
  });

  //Modifier la justification d'un compteur
  UpdateJustification = this.effect(
    (justificationData$: Observable<IEditJustificationData>) => {
      return justificationData$.pipe(
        switchMap((justificationData: IEditJustificationData) => {
          return this.compteursService
            .updateJustification(justificationData)
            .pipe(
              tap(() => {
                this.toasterService.success(
                  this.translateService.instant('commun.operationTerminee')
                );
                //on relance la recherche pour réinitialiser les données
                this.CompteursSearch();
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'updateJustification')
              )
            );
        })
      );
    }
  );

  //Ajouter une action à un compteur
  AddActionToCompteur = this.effect(
    (addActionData$: Observable<ICompteurAddActionData>) => {
      return addActionData$.pipe(
        switchMap((addActionData: ICompteurAddActionData) => {
          return this.compteursService.addActionToCompteur(addActionData).pipe(
            tap(() => {
              this.toasterService.success(
                this.translateService.instant('commun.operationTerminee')
              );
              //on relance la recherche pour réinitialiser les données
              this.CompteursSearch();
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'addAction')
            )
          );
        })
      );
    }
  );

  //Ajouter une pièce jointe
  UploadAttachment = this.effect(
    (compteurDocumentUploadData$: Observable<IDocumentUploadData>) => {
      return compteurDocumentUploadData$.pipe(
        switchMap((compteurDocumentUploadData: IDocumentUploadData) => {
          return this.compteursService
            .uploadAttachment(compteurDocumentUploadData)
            .pipe(
              tap(() => {
                this.toasterService.success(
                  this.translateService.instant('commun.operationTerminee')
                );
                //on relance la recherche pour réinitialiser les données
                this.CompteursSearch();
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'uploadAttachment')
              )
            );
        })
      );
    }
  );

  //Supprimer une pièce jointe
  DeleteAttachment = this.effect((fichierId$: Observable<number>) => {
    return fichierId$.pipe(
      switchMap((fichierId: number) => {
        return this.compteursService.deleteAttachment(fichierId).pipe(
          tap(() => {
            this.toasterService.success(
              this.translateService.instant('commun.operationTerminee')
            );
            //on relance la recherche pour réinitialiser les données
            this.CompteursSearch();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteAttachment')
          )
        );
      })
    );
  });

  //Télécharger une pièce jointe
  DownloadAttachment = this.effect((attachment$: Observable<IAttachment>) => {
    return attachment$.pipe(
      switchMap((attachment: IAttachment) => {
        return this.compteursService.downloadAttachment(attachment.id).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'downloadAttachment')
          )
        );
      })
    );
  });

  //Exporter les compteurs en PDF
  ExportPDFCompteurs = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.SearchCriteriaSelector$),
      switchMap(([_, searchCriteria]: [void, ISearchCriteria]) => {
        return this.compteursService.exportPDFCompteurs(searchCriteria).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportPdf')
          )
        );
      })
    )
  );
  //Exporter le fichier OTC ds compteurs
  ExportFichierOTC = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.SearchCriteriaSelector$),
      switchMap(([_, searchCriteria]: [void, ISearchCriteria]) => {
        return this.compteursService.exportFichierOTC(searchCriteria).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportPdf')
          )
        );
      })
    )
  );

  //check compteurs : justification de tous les compteurs niveau 1 du mois en cours
  CheckCompteur = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.SearchCriteriaSelector$),
      switchMap(([_, searchCriteria]: [void, ISearchCriteria]) => {
        return this.compteursService.checkCompteurs(searchCriteria).pipe(
          tap(() => {
            this.toasterService.success(
              this.translateService.instant('commun.operationTerminee')
            );
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'checkCompteur')
          )
        );
      })
    )
  );

  FetchControleurs = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return this.usersService.getControleurs().pipe(
          tap((controleurs: PaginatedApiResponse<IControleur>) => {
            this.SetControleurs(controleurs?.data);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'fetchControleurs')
          )
        );
      })
    )
  );
}
