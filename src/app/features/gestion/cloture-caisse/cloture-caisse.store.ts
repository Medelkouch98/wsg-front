import {
  IWsError,
  PaginatedApiResponse,
  QueryParam,
  WsErrorClass,
} from '@app/models';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ClotureCaisseService } from './services/cloture-caisse.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { SharedService } from '@app/services';
import {
  ClotureCaisseInitialData,
  ClotureCaisseRequest,
  Comptage,
  IClotureCaisseInitialData,
  IClotureCaisseRecapitulatif,
  IClotureCaisseRequest,
  IClotureCaisseSearchResponse,
  IClotureRequestResponse,
  IComptage,
  IEcart,
  IFeuilleDeCaisse,
  ISearchCriteria,
  SearchCriteria,
} from './models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment/moment';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { TypeComptageEnum } from './enums';
import { ClotureCaisseHelper } from './helpers/cloture-caisse.helper';

export interface ClotureCaisseState {
  clotureCaisseList: PaginatedApiResponse<IClotureCaisseSearchResponse>;
  feuilleDeCaisse: IFeuilleDeCaisse;
  clotureCaisseRequest: IClotureCaisseRequest;
  clotureCaisseInitialData: IClotureCaisseInitialData;
  searchForm: ISearchCriteria;
  sort: Sort;
  pageEvent: PageEvent;
  errors?: IWsError;
}

export const initialClotureCaisseState: ClotureCaisseState = {
  clotureCaisseList: null,
  feuilleDeCaisse: null,
  clotureCaisseRequest: new ClotureCaisseRequest(),
  clotureCaisseInitialData: new ClotureCaisseInitialData(),
  searchForm: new SearchCriteria(),
  sort: { active: 'id', direction: 'desc' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  errors: null,
};

@Injectable()
export class ClotureCaisseStore extends ComponentStore<ClotureCaisseState> {
  constructor(
    private clotureCaisseService: ClotureCaisseService,
    private translateService: TranslateService,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private toasterService: ToastrService
  ) {
    super(initialClotureCaisseState);
  }

  //Selectors

  searchForm$ = this.select((state: ClotureCaisseState) => state.searchForm);

  feuilleDeCaisse$ = this.select(
    (state: ClotureCaisseState) => state.feuilleDeCaisse
  );

  clotureCaisseRequest$ = this.select(
    (state: ClotureCaisseState) => state.clotureCaisseRequest
  );
  clotureCaisseInitialData$ = this.select(
    (state: ClotureCaisseState) => state.clotureCaisseInitialData
  );

  /**
   * récupérer les données du récapitulatif des comptages
   * @type {Observable<IClotureCaisseRecapitulatif[]>}
   */
  clotureCaisseRecap$ = this.select((state: ClotureCaisseState) => {
    return [
      ClotureCaisseHelper.getRecapitulatif(state, TypeComptageEnum.TYPE_ESPECE),
      ClotureCaisseHelper.getRecapitulatif(state, TypeComptageEnum.TYPE_CHEQUE),
      ClotureCaisseHelper.getRecapitulatif(
        state,
        TypeComptageEnum.TYPE_CARTE_BANCAIRE
      ),
      ClotureCaisseHelper.getRecapitulatif(
        state,
        TypeComptageEnum.TYPE_INTERNET
      ),
      ClotureCaisseHelper.getRecapitulatif(
        state,
        TypeComptageEnum.TYPE_VIREMENT
      ),
      ClotureCaisseHelper.getRecapitulatif(state, TypeComptageEnum.TYPE_COUPON),
      ClotureCaisseHelper.getRecapitulatif(
        state,
        TypeComptageEnum.TYPE_SANS_REGLEMENT
      ),
      ClotureCaisseHelper.getRecapitulatif(
        state,
        TypeComptageEnum.TYPE_GRATUIT
      ),
    ];
  });

  clotureCaisseRequestComptagesByType$ = (type: TypeComptageEnum) =>
    this.select((state) =>
      state.clotureCaisseRequest.comptages.filter(
        (comptage: IComptage) => comptage.type === type
      )
    );

  totalEspeces$ = this.select((state: ClotureCaisseState) =>
    ClotureCaisseHelper.getTotalEspeces(state.clotureCaisseRequest.comptages, [
      TypeComptageEnum.TYPE_ESPECE_PIECE,
      TypeComptageEnum.TYPE_ESPECE_BILLET,
    ])
  );

  fondDeCaisseEtEncaissementDuJour$ = this.select(
    (state: ClotureCaisseState) =>
      state.clotureCaisseInitialData?.fond_caisse_initial +
      ClotureCaisseHelper.getTotalEspeces(
        state.clotureCaisseRequest.comptages,
        [
          TypeComptageEnum.TYPE_ESPECE_PIECE,
          TypeComptageEnum.TYPE_ESPECE_BILLET,
        ]
      )
  );

  clotureCaisseList$ = this.select(
    (state: ClotureCaisseState) => state.clotureCaisseList
  );

  sort$ = this.select((state: ClotureCaisseState) => state.sort);

  pageEvent$ = this.select((state: ClotureCaisseState) => state.pageEvent);

  errors$ = this.select((state: ClotureCaisseState) => state.errors);

  //Updaters

  setSearchForm = this.updater(
    (state: ClotureCaisseState, searchForm: ISearchCriteria) => ({
      ...state,
      searchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
    })
  );

  initClotureRequest = this.updater(
    (
      state: ClotureCaisseState,
      data: { date_debut: string | Date; date_fin: string | Date }
    ) => ({
      ...state,
      clotureCaisseRequest: {
        ...new ClotureCaisseRequest(),
        date_debut: data.date_debut
          ? moment(data.date_debut, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null,
        date_fin: data.date_fin
          ? moment(data.date_fin, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null,
      },
    })
  );

  addNewComptage = this.updater(
    (state: ClotureCaisseState, type: TypeComptageEnum) => ({
      ...state,
      clotureCaisseRequest: {
        ...state.clotureCaisseRequest,
        comptages: [
          new Comptage(type),
          ...state.clotureCaisseRequest.comptages,
        ],
      },
    })
  );

  addOrUpdateComptage = this.updater(
    (
      state: ClotureCaisseState,
      data: {
        comptage: IComptage;
        index: number;
        type: TypeComptageEnum;
      }
    ) => ({
      ...state,
      clotureCaisseRequest: {
        ...state.clotureCaisseRequest,
        comptages: [
          ...state.clotureCaisseRequest?.comptages?.filter(
            (c) => c.type !== data.type
          ),
          ...state.clotureCaisseRequest?.comptages
            ?.filter((c) => c.type === data.type)
            ?.map((element: IComptage, index: number) => {
              if (index === data.index) {
                return data.comptage;
              }
              return element;
            }),
        ],
      },
    })
  );

  removeComptage = this.updater(
    (
      state: ClotureCaisseState,
      data: { index: number; type: TypeComptageEnum }
    ) => ({
      ...state,
      clotureCaisseRequest: {
        ...state.clotureCaisseRequest,
        comptages: [
          ...state.clotureCaisseRequest?.comptages?.filter(
            (c) => c.type !== data.type
          ),
          ...state.clotureCaisseRequest?.comptages
            ?.filter((c) => c.type === data.type)
            .filter((element, i: number) => i !== data.index),
        ],
      },
    })
  );

  setSort = this.updater((state: ClotureCaisseState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  setPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  setFondCaisseFinal = this.updater(
    (state: ClotureCaisseState, fondCaisseFinal: number) => ({
      ...state,
      clotureCaisseRequest: {
        ...state.clotureCaisseRequest,
        fond_caisse_final: fondCaisseFinal,
      },
    })
  );

  setEcart = this.updater((state: ClotureCaisseState, ecart: IEcart) => ({
    ...state,
    clotureCaisseRequest: {
      ...state.clotureCaisseRequest,
      ecarts: [
        ...state.clotureCaisseRequest.ecarts.filter(
          (e) => e.type !== ecart.type
        ),
        ecart,
      ],
    },
  }));
  resetSearchForm = () => this.patchState({ searchForm: new SearchCriteria() });

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

  //EFFECTS

  /**
   * chercher les cloture de caisse
   */
  clotureCaisseSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$, this.sort$, this.pageEvent$),
      switchMap(
        ([_, searchForm, sort, pageEvent]: [
          any,
          ISearchCriteria,
          Sort,
          PageEvent
        ]) => {
          const data: ISearchCriteria = {
            date_debut: searchForm.date_debut
              ? moment(searchForm.date_debut, 'YYYY-MM-DD').format('YYYY-MM-DD')
              : null,
            date_fin: searchForm.date_fin
              ? moment(searchForm.date_fin, 'YYYY-MM-DD').format('YYYY-MM-DD')
              : null,
            fin_mois: searchForm.fin_mois,
          };
          return this.clotureCaisseService
            .searchClotureCaisse(
              data,
              sort,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize
            )
            .pipe(
              tap(
                (
                  clotureCaisseList: PaginatedApiResponse<IClotureCaisseSearchResponse>
                ) => {
                  this.patchState({ clotureCaisseList });
                }
              ),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'searchError')
              )
            );
        }
      )
    )
  );

  /**
   * récupérer la dernière cloture de caisse
   */
  getLastClotureCaisse = this.effect(
    (
      trigger$: Observable<{
        action: (data: IClotureCaisseSearchResponse) => void;
      }>
    ) =>
      trigger$.pipe(
        switchMap((trigger) => {
          return this.clotureCaisseService.getLastCloture().pipe(
            tap((lastClotureCaisse: IClotureCaisseSearchResponse) => {
              trigger.action(lastClotureCaisse);
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'lastClotureCaisseError')
            )
          );
        })
      )
  );

  /**
   * récupérer la feuille de caisse
   */
  getFeuilleDeCaisse = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.clotureCaisseService.getFeuilleDeCaisse(params['id']).pipe(
          tap((feuilleDeCaisse: IFeuilleDeCaisse) => {
            this.patchState({ feuilleDeCaisse });
          }),
          catchError((error: HttpErrorResponse) => {
            this.goToClotureCaisse();
            return this.setWsError(error, 'clientInfosFicheError');
          })
        )
      )
    )
  );
  /**
   * verifier la possibilité de cloture de caisse
   */
  verifyClotureCaisse = this.effect(
    (
      trigger$: Observable<{
        data: { date_debut: string | Date; date_fin: string | Date };
        canCloture: () => void;
        cantCloture: () => void;
        verificationFinished: () => void;
      }>
    ) =>
      trigger$.pipe(
        switchMap(
          (trigger: {
            data: { date_debut: string | Date; date_fin: string | Date };
            canCloture: () => void;
            cantCloture: () => void;
            verificationFinished: () => void;
          }) => {
            const data = {
              date_debut: moment(trigger.data.date_debut, 'YYYY-MM-DD').format(
                'YYYY-MM-DD'
              ),
              date_fin: moment(trigger.data.date_fin, 'YYYY-MM-DD').format(
                'YYYY-MM-DD'
              ),
            };
            const searchQuery: QueryParam =
              this.sharedService.getSearchQuery(data);
            return this.clotureCaisseService
              .verifyClotureCaisse(searchQuery)
              .pipe(
                tap((canClotureCaisse: Boolean) => {
                  if (canClotureCaisse) {
                    trigger.canCloture();
                  } else {
                    trigger.cantCloture();
                  }
                  trigger.verificationFinished();
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'verifyClotureError')
                )
              );
          }
        )
      )
  );
  /**
   * récupérer les données nécessaires pour la preparation de la création de cloture
   */
  getClotureDeCaisseInitialData = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.clotureCaisseRequest$),
      switchMap(([_, clotureCaisseRequest]: [any, IClotureCaisseRequest]) => {
        const date_debut = clotureCaisseRequest.date_debut
          ? moment(clotureCaisseRequest.date_debut, 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          : null;
        const date_fin = clotureCaisseRequest.date_fin
          ? moment(clotureCaisseRequest.date_fin, 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          : null;
        return this.clotureCaisseService
          .getClotureDeCaisseInitialData(date_debut, date_fin)
          .pipe(
            tap((clotureCaisseInitialData: IClotureCaisseInitialData) => {
              clotureCaisseRequest.fond_caisse_initial =
                clotureCaisseInitialData.fond_caisse_initial;
              clotureCaisseRequest.comptages = [
                ...clotureCaisseRequest.comptages, //comptages existant (espèces)
                ...ClotureCaisseHelper.mapReglementsSummaryToComptage(
                  clotureCaisseInitialData.reglements_summary
                ),
              ];
              this.patchState({
                clotureCaisseInitialData,
                clotureCaisseRequest,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'searchError')
            )
          );
      })
    )
  );

  /**
   * clôturer la caisse
   */
  cloturerCaisse = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.clotureCaisseRequest$),
      switchMap(([_, clotureForm]: [any, IClotureCaisseRequest]) => {
        clotureForm.date_debut = clotureForm.date_debut
          ? moment(clotureForm.date_debut, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null;
        clotureForm.date_fin = clotureForm.date_fin
          ? moment(clotureForm.date_fin, 'YYYY-MM-DD').format('YYYY-MM-DD')
          : null;

        ClotureCaisseHelper.setClotureCaisseRequestTotals(clotureForm);

        //removing read only fields
        clotureForm.comptages = clotureForm.comptages.map((c) => {
          delete c.factures;
          delete c.isNew;
          delete c.isEditable;
          return c;
        });

        return this.clotureCaisseService.cloturerCaisse(clotureForm).pipe(
          tap((response: IClotureRequestResponse) => {
            this.toasterService.success(
              this.translateService.instant('commun.operationTerminee')
            );
            //redirection vers la feuille de caisse
            this.goToFeuilleDeClotureCaisse(response.id);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'searchError')
          )
        );
      })
    )
  );

  /**
   * supprimer une cloture de caisse
   */
  deleteClotureCaisse = this.effect((clotureId$: Observable<number>) =>
    clotureId$.pipe(
      switchMap((clotureId: number) =>
        this.clotureCaisseService.deleteCloture(clotureId).pipe(
          tap(() => {
            this.toasterService.success(
              this.translateService.instant('commun.operationTerminee')
            );
            //On relance la recherche
            this.clotureCaisseSearch();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteClotureError')
          )
        )
      )
    )
  );

  /**
   * redirection vers la page de feuille de caisse
   */
  goToFeuilleDeClotureCaisse = this.effect((id$: Observable<number>) =>
    id$.pipe(
      tap((id: number) => this.router.navigate(['p/gestion/cloture', id]))
    )
  );

  /**
   * redirection vers le fiche controle
   */
  GoToFicheControle = this.effect((idControle$: Observable<number>) =>
    idControle$.pipe(
      tap((idControle: number) =>
        this.sharedService.redirectToNewTab(['/p/activity/fiche', idControle])
      )
    )
  );
  /**
   * redirection vers la page de cloture de caisse
   */
  goToClotureCaisse = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['p/gestion/cloture'])))
  );

  /**
   * redirection vers le formulaire de cloture de caisse
   */
  goToClotureCaisseForm = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.router.navigate(['p/gestion/cloture/add']);
      })
    )
  );

  /**
   * redirection vers le formulaire de cloture de caisse
   */
  goToReglement = this.effect((trigger$: Observable<number>) =>
    trigger$.pipe(
      withLatestFrom(this.clotureCaisseRequest$),
      tap(
        ([mode_reglement_id, clotureCaisseRequest]: [
          number,
          IClotureCaisseRequest
        ]) => {
          this.sharedService.redirectToNewTab(['/p/gestion/reglements'], {
            mode_reglement_id,
            date_reglement_start: clotureCaisseRequest.date_debut,
            date_reglement_end: clotureCaisseRequest.date_fin,
          });
        }
      )
    )
  );

  /**
   * redirection vers la page de paramétrage de caisse
   */
  goToClotureCaisseSettings = this.effect((trigger$) =>
    trigger$.pipe(
      //TODO: put correct url for the caisse/facturation settings page once the page is ready
      tap(() => this.router.navigate(['p/gestion/cloture/settings']))
    )
  );
}
