import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  IPrestation,
  IStatisticCardData,
  ITva,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';

import { PrestationService } from './services/prestation.service';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DEFAULT_PAGE_SIZE, REDEVANCE_OTC } from '@app/config';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IPrestationsSearchRequestForm,
  IPrestationIdentificationForm,
  IAgendaPrestationElement,
  IAgendaPrestationCategories,
  PrestationIdentificationForm,
  ITarificationPrice,
  PrestationsSearchRequestForm,
  IPrestationsStatistics,
} from './models';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { Params, Router } from '@angular/router';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { AppState } from '../../../core/store/app.state';
import { ITarification } from '../tarification/models';
import { TarificationHelper } from '@app/helpers';
import { TVAsSelector } from '../../../core/store/resources/resources.selector';
import { ToastrService } from 'ngx-toastr';

export interface PrestationState {
  prestationSearchResponse: PaginatedApiResponse<IPrestation>;
  searchClicked: boolean;
  prestationSearchRequestForm: IPrestationsSearchRequestForm;
  prestation: IPrestationIdentificationForm;
  isIdentificationValidated: boolean;
  tarificationClient: PaginatedApiResponse<ITarificationPrice>;
  tarificationApporteurAffaires: PaginatedApiResponse<ITarificationPrice>;
  agendaPrestationElements: IAgendaPrestationElement[];
  agendaPrestationCategories: IAgendaPrestationCategories[];
  sort: Sort;
  clientSort: Sort;
  apporteurAffaireSort: Sort;
  pageEvent: PageEvent;
  clientPageEvent: PageEvent;
  apporteurAffairePageEvent: PageEvent;
  prestationsStatistics: IStatisticCardData[];
  errors?: IWsError;
}

export const prestationState: PrestationState = {
  prestationSearchResponse: null,
  prestationSearchRequestForm: new PrestationsSearchRequestForm(),
  searchClicked: false,
  prestation: null,
  isIdentificationValidated: false,
  tarificationClient: null,
  tarificationApporteurAffaires: null,
  agendaPrestationElements: [],
  agendaPrestationCategories: [],
  sort: { active: '', direction: '' },
  clientSort: { active: '', direction: '' },
  apporteurAffaireSort: { active: '', direction: '' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  clientPageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  apporteurAffairePageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  prestationsStatistics: [],
  errors: null,
};

@Injectable()
export class PrestationStore extends ComponentStore<PrestationState> {
  constructor(
    private store: Store<AppState>,
    private prestationService: PrestationService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    super(prestationState);
  }

  //Selectors

  private tvas$: Observable<ITva[]> = this.store.pipe(select(TVAsSelector));

  Sort$ = this.select((state: PrestationState) => state.sort);
  SortClientSelector$ = this.select(
    (state: PrestationState) => state.clientSort
  );
  SortApporteurAffaireSelector$ = this.select(
    (state: PrestationState) => state.apporteurAffaireSort
  );
  PageEvent$ = this.select((state: PrestationState) => state.pageEvent);
  PageEventClientSelector$ = this.select(
    (state: PrestationState) => state.clientPageEvent
  );
  PageEventApporteurAffaireSelector$ = this.select(
    (state: PrestationState) => state.apporteurAffairePageEvent
  );
  SearchFormSelector$ = this.select(
    (state: PrestationState) => state.prestationSearchRequestForm
  );
  searchClicked$ = this.select((state: PrestationState) => state.searchClicked);
  PrestationSelector$ = this.select(
    (state: PrestationState) => state.prestation
  );

  PrestationSearchResponseSelector$ = this.select(
    (state: PrestationState) => state.prestationSearchResponse
  );
  TarificationClientSelector$ = this.select(
    (state: PrestationState) => state.tarificationClient
  );

  public tarificationApporteurAffairesSelector$ = this.select(
    ({ tarificationApporteurAffaires }: PrestationState) =>
      tarificationApporteurAffaires
  );

  AgendaPrestationElementsSelector$ = this.select(
    (state: PrestationState) => state.agendaPrestationElements
  );

  AgendaPrestationCategoriesSelector$ = this.select(
    (state: PrestationState) => state.agendaPrestationCategories
  );

  IsIdentificationValidated$ = this.select(
    (state: PrestationState) => state.isIdentificationValidated
  );

  PrestationsStatistics$ = this.select(
    (state: PrestationState) => state.prestationsStatistics
  );

  //Updaters

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = true,
    errorKeyBack: string = ''
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow =
      (errorKeyBack && error.error?.errors[errorKeyBack][0]) ||
      this.translateService.instant('commercial.errors.' + errorMessage);
    this.patchState({
      errors: {
        ...iWsError,
        messageToShow,
      },
    });
    showToaster ? this.toastrService.error(messageToShow) : '';
    return of(error);
  };

  SetSort = this.updater((state: PrestationState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  SetClientSort = this.updater((state: PrestationState, clientSort: Sort) => ({
    ...state,
    clientSort,
    clientPageEvent: { ...state.clientPageEvent, pageIndex: 0 },
  }));

  SetApporteurAffaireSort = this.updater(
    (state: PrestationState, apporteurAffaireSort: Sort) => ({
      ...state,
      apporteurAffaireSort,
      apporteurAffairePageEvent: {
        ...state.apporteurAffairePageEvent,
        pageIndex: 0,
      },
    })
  );

  SetPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  SetApporteurAffairePageEvent = (apporteurAffairePageEvent: PageEvent) =>
    this.patchState({ apporteurAffairePageEvent });

  SetClientPageEvent = (clientPageEvent: PageEvent) =>
    this.patchState({ clientPageEvent });

  ResetSearchForm = () =>
    this.patchState({
      prestationSearchRequestForm: new PrestationsSearchRequestForm(),
    });

  SetAgendaPrestationElements = (
    agendaPrestationElements: IAgendaPrestationElement[]
  ) => this.patchState({ agendaPrestationElements });

  SetAgendaPrestationCategories = (
    agendaPrestationCategories: IAgendaPrestationCategories[]
  ) => this.patchState({ agendaPrestationCategories });

  SetPrestationSearchResponse = (
    prestationSearchResponse: PaginatedApiResponse<IPrestation>
  ) => this.patchState({ prestationSearchResponse });

  SetTarificationClientResponse = (
    tarificationClient: PaginatedApiResponse<ITarificationPrice>
  ) => this.patchState({ tarificationClient });

  setTarificationApporteurAffairesResponse = (
    tarificationApporteurAffaires: PaginatedApiResponse<ITarificationPrice>
  ) => this.patchState({ tarificationApporteurAffaires });

  SetIsIdentificationValidated = (isIdentificationValidated: boolean) =>
    this.patchState({ isIdentificationValidated });

  SetPrestation = (prestation: IPrestationIdentificationForm) =>
    this.patchState({
      prestation: {
        ...prestation,
        prix_ht: Number(prestation.prix_ht).toFixed(2).toString(),
      },
    });

  InitialisePrestation = () =>
    this.patchState({
      prestation: new PrestationIdentificationForm(),
      isIdentificationValidated: false,
    });

  SetPrestationSearchForm = this.updater(
    (
      state: PrestationState,
      prestationSearchRequestForm: IPrestationsSearchRequestForm
    ) => ({
      ...state,
      prestationSearchRequestForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  //Effects

  /**
   * Récupérer les details de la prestation
   */
  GetPrestation = this.effect((trigger$) => {
    return trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.prestationService.getPrestation(params.id).pipe(
          tap((response: IPrestationIdentificationForm) => {
            this.SetPrestation(response);
            this.GetTarificationClient();
            this.GetTarificationApporteurAffaires();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getPrestationDetailsError')
          )
        )
      )
    );
  });

  /**
   * Récupérer les agendas
   */
  GetAgendaPrestationElements = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() =>
        this.prestationService.getAgendaPrestationElements().pipe(
          tap((agendaPrestationElements: IAgendaPrestationElement[]) =>
            this.SetAgendaPrestationElements(agendaPrestationElements)
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getAgendasError')
          )
        )
      )
    );
  });

  /**
   * Récupérer les catégories
   */
  GetAgendaPrestationCategories = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() =>
        this.prestationService.getAgendaPrestationCategories().pipe(
          tap((agendaPrestationCategories: IAgendaPrestationCategories[]) =>
            this.SetAgendaPrestationCategories(agendaPrestationCategories)
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getCategoriesError')
          )
        )
      )
    );
  });

  //Recherche de prestations
  PrestationSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.Sort$, this.PageEvent$, this.SearchFormSelector$),
      switchMap(
        ([_, sort, pageEvent, searchForm]: [
          any,
          Sort,
          PageEvent,
          IPrestationsSearchRequestForm
        ]) => {
          return this.prestationService
            .searchPrestations(
              searchForm,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize,
              sort
            )
            .pipe(withLatestFrom(this.tvas$))
            .pipe(
              map(this.addTVAAndTTC),
              tap((response: PaginatedApiResponse<IPrestation>) =>
                this.SetPrestationSearchResponse(response)
              ),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'getSearchError')
              )
            );
        }
      )
    )
  );

  public GetTarificationClient = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.SortClientSelector$,
        this.PageEventClientSelector$,
        this.store.select(RouterParamsSelector)
      ),
      switchMap(
        ([_, sort, pageEvent, params]: [any, Sort, PageEvent, Params]) => {
          return this.prestationService
            .getTarificationClient(
              params.id,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize,
              sort
            )
            .pipe(withLatestFrom(this.PrestationSelector$, this.tvas$))
            .pipe(
              map(this.getTarificationPrice),
              tap((tarifs: PaginatedApiResponse<ITarificationPrice>) =>
                this.SetTarificationClientResponse(tarifs)
              ),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'getSearchError')
              )
            );
        }
      )
    )
  );

  public GetTarificationApporteurAffaires = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.SortApporteurAffaireSelector$,
        this.PageEventApporteurAffaireSelector$,
        this.store.select(RouterParamsSelector)
      ),
      switchMap(
        ([_, sort, pageEvent, params]: [any, Sort, PageEvent, Params]) => {
          return this.prestationService
            .getTarificationApporteurAffaires(
              params.id,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize,
              sort
            )
            .pipe(withLatestFrom(this.PrestationSelector$, this.tvas$))
            .pipe(
              map(this.getTarificationPrice),
              tap((tarifs: PaginatedApiResponse<ITarificationPrice>) =>
                this.setTarificationApporteurAffairesResponse(tarifs)
              ),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'getSearchError')
              )
            );
        }
      )
    )
  );

  //Ajouter une prestation
  SavePrestation = this.effect(
    (identificationForm$: Observable<IPrestationIdentificationForm>) => {
      return identificationForm$.pipe(
        switchMap((identificationForm: IPrestationIdentificationForm) => {
          return this.prestationService.addPrestation(identificationForm).pipe(
            tap((_: IPrestationIdentificationForm) => {
              this.toastrService.success(
                this.translateService.instant('commun.operationTerminee')
              );

              this.PrestationSearch();
              this.router.navigate(['/p/commercial/prestations']);
            }),
            catchError((error: HttpErrorResponse) => {
              const firstErrorKey =
                error.error?.errors && Object.keys(error.error.errors)[0];
              return this.setWsError(
                error,
                'addPrestationError',
                true,
                firstErrorKey
              );
            })
          );
        })
      );
    }
  );
  //Modifier l'identification d'une prestation
  UpdatePrestation = this.effect(
    (
      trigger$: Observable<{
        prestationId: number;
        data: { [key: string]: any };
      }>
    ) => {
      return trigger$.pipe(
        switchMap(
          (trigger: { data: { [key: string]: any }; prestationId: number }) => {
            return this.prestationService
              .updatePrestation(trigger.prestationId, trigger.data)
              .pipe(
                tap((prestation: IPrestationIdentificationForm) => {
                  this.SetPrestation(prestation);
                  this.toastrService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'updatePrestationError')
                )
              );
          }
        )
      );
    }
  );

  /**
   * Calculer le prix remise HT et HT après remise
   * @param paginatedTarifs Liste paginée des tarifs
   * @param prestation Prestation séléctionée
   * @param tvas Liste des tvas
   * @return Liste paginée des tarifs avec prix après remise
   */
  private readonly getTarificationPrice = ([
    paginatedTarifs,
    prestation,
    tvas,
  ]: [
    PaginatedApiResponse<ITarification>,
    IPrestationIdentificationForm,
    ITva[]
  ]): PaginatedApiResponse<ITarificationPrice> => ({
    ...paginatedTarifs,
    data: paginatedTarifs.data.map((tarif) => {
      const tva = tvas?.find(({ id }) => id === prestation.tva_id);
      return {
        ...tarif,
        prixRemiseHT: TarificationHelper.calculateHTRemise(
          prestation as IPrestation,
          tarif.remise_euro,
          tarif.remise_pourcentage
        ),
        prixRemiseTTC: TarificationHelper.calculateTTCRemise(
          prestation as IPrestation,
          tarif.remise_euro,
          tarif.remise_pourcentage,
          tva
        ),
      };
    }),
  });

  /**
   * Ajouter le TVA aux prestations
   * @param paginatedTarifs Liste paginée des prestations
   * @param tvas Liste des tvas
   * @return Liste paginée des prestations avec tva
   */
  private readonly addTVAAndTTC = ([paginatedTarifs, tvas]: [
    PaginatedApiResponse<IPrestation>,
    ITva[]
  ]): PaginatedApiResponse<IPrestation> => ({
    ...paginatedTarifs,
    data: paginatedTarifs.data.map((tarif) => {
      const tva = tvas?.find(({ id }) => id === tarif.tva_id);

      let ttc = TarificationHelper.calculatePrixttc(tarif?.prix_ht, tva?.taux);
      ttc = tarif?.soumis_redevance ? ttc + REDEVANCE_OTC.prix_ttc : ttc; //Si la prestation est soumise à l'OTC, le TTC inclut 0.34 centimes.
      return {
        ...tarif,
        tva,
        ttc,
      };
    }),
  });

  getPrestationsStatistics = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.prestationService.getPrestationsStatistics().pipe(
          tap((prestationsStatistics: IPrestationsStatistics) =>
            this.patchState({
              prestationsStatistics: [
                {
                  class: 'bg-sky-600',
                  value: prestationsStatistics?.VTP,
                  label: 'commercial.prestations.statistics.vtp',
                },
                {
                  class: 'bg-indigo-600',
                  value: prestationsStatistics?.CV,
                  label: 'commercial.prestations.statistics.cv',
                },
                {
                  class: 'bg-teal-600',
                  value: prestationsStatistics?.VTC,
                  label: 'commercial.prestations.statistics.vtc',
                },
                {
                  class: 'bg-orange-600',
                  value: prestationsStatistics?.CVC,
                  label: 'commercial.prestations.statistics.cvc',
                },
              ],
            })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'prestationsStatisticsError', true)
          )
        )
      )
    )
  );
}
