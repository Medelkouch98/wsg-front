import {
  ApporteurAffaireContact,
  ApporteurAffaireSearchForm,
  IApporteurAffaireContact,
  IApporteurAffaireIdentification,
  IApporteurAffaireSearchForm,
  IApporteurAffaireStatistics,
} from './models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import {
  ApporteurAffaireLocal,
  ApporteurAffaireNational,
  IApporteurAffaire,
  IApporteurAffaireLocal,
  IApporteurAffaireNational,
  IStatisticCardData,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import {
  DEFAULT_PAGE_SIZE,
  TYPE_APPORTEURS,
  TypeApporteurAffaire,
} from '@app/config';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppState } from 'app/core/store/app.state';
import { select, Store } from '@ngrx/store';
import { RouterParamsSelector } from 'app/core/store/router/router.selector';
import { iif, Observable, of } from 'rxjs';
import { ITarification } from '../tarification/models';
import { ApporteurAffaireService, SharedService } from '@app/services';

export interface ApporteurAffaireState {
  apporteurAffaireStatistics: IStatisticCardData[];
  apporteurAffaireSearchResponse: PaginatedApiResponse<IApporteurAffaire>;
  searchClicked: boolean;
  apporteurAffaireSearchForm: IApporteurAffaireSearchForm;
  apporteurAffaireLocal: IApporteurAffaireLocal;
  apporteurAffaireNational: IApporteurAffaireNational;
  isIdentificationValidated: boolean;
  sort: Sort;
  pageEvent: PageEvent;
  typeApporteurAffaireList: TypeApporteurAffaire[];
  errors?: IWsError;
}

export const initialApporteurAffaireState: ApporteurAffaireState = {
  apporteurAffaireStatistics: [],
  apporteurAffaireSearchResponse: null,
  searchClicked: false,
  apporteurAffaireSearchForm: new ApporteurAffaireSearchForm(),
  apporteurAffaireLocal: new ApporteurAffaireLocal(),
  apporteurAffaireNational: new ApporteurAffaireNational(),
  isIdentificationValidated: false,
  sort: { active: '', direction: '' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  typeApporteurAffaireList: TYPE_APPORTEURS,

  errors: null,
};

@Injectable()
export class ApporteurAffaireStore extends ComponentStore<ApporteurAffaireState> {
  constructor(
    private apporteurAffaireService: ApporteurAffaireService,
    private translateService: TranslateService,
    private store: Store<AppState>,
    private toasterService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {
    super(initialApporteurAffaireState);
  }

  //Selectors

  Sort$ = this.select((state: ApporteurAffaireState) => state.sort);

  PageEvent$ = this.select((state: ApporteurAffaireState) => state.pageEvent);

  TypesApporteurAffaireListSelector$ = this.select(
    (state: ApporteurAffaireState) => state.typeApporteurAffaireList
  );

  SearchFormSelector$ = this.select(
    (state: ApporteurAffaireState) => state.apporteurAffaireSearchForm
  );

  searchClicked$ = this.select(
    (state: ApporteurAffaireState) => state.searchClicked
  );

  ApporteurAffaireSearchResponseSelector$ = this.select(
    (state: ApporteurAffaireState) => state.apporteurAffaireSearchResponse
  );

  ApporteurAffaireLocalSelector$ = this.select(
    (state: ApporteurAffaireState) => state.apporteurAffaireLocal
  );

  ApporteurAffaireNationalSelector$ = this.select(
    (state: ApporteurAffaireState) => state.apporteurAffaireNational
  );

  ApporteurAffaireLocalRemiseGlobalSelector$ = this.select(
    (state: ApporteurAffaireState) =>
      state.apporteurAffaireLocal?.pourcentage_remise
  );

  IsIdentificationValidated$ = this.select(
    (state: ApporteurAffaireState) => state.isIdentificationValidated
  );

  ApporteurAffaireLocalContactSelector$ = this.select(
    (state: ApporteurAffaireState) =>
      state.apporteurAffaireLocal?.contacts || []
  );

  ApporteurAffaireLocalTarificationSelector$ = this.select(
    (state: ApporteurAffaireState) =>
      state.apporteurAffaireLocal?.prestations || []
  );

  ApporteurAffaireNationalRemiseSelector$ = this.select(
    (state: ApporteurAffaireState) =>
      state.apporteurAffaireNational?.remises || []
  );

  ApporteurAffaireStatistics$ = this.select(
    (state: ApporteurAffaireState) => state.apporteurAffaireStatistics
  );

  //Updaters

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'commercial.errors.' + errorMessage
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

  SetSort = this.updater((state: ApporteurAffaireState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  SetPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  SetApporteurAffaireSearchForm = this.updater(
    (
      state: ApporteurAffaireState,
      apporteurAffaireSearchForm: IApporteurAffaireSearchForm
    ) => ({
      ...state,
      apporteurAffaireSearchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  ResetApporteurAffaireSearchForm = () =>
    this.patchState({
      apporteurAffaireSearchForm: new ApporteurAffaireSearchForm(),
    });

  InitialiseApporteurAffaire = () =>
    this.patchState({
      apporteurAffaireLocal: new ApporteurAffaireLocal(),
      isIdentificationValidated: false,
    });

  SetIsIdentificationValidated = (isIdentificationValidated: boolean) =>
    this.patchState({ isIdentificationValidated });

  SetApporteurAffaireIdentification = this.updater(
    (
      state: ApporteurAffaireState,
      identification: IApporteurAffaireIdentification
    ) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        id: identification.id,
        nom: identification.nom,
        adresse: identification.adresse,
        suite: identification.suite,
        cp: identification.cp,
        ville: identification.ville,
        fixe: identification.fixe,
        email: identification.email,
        civilite_id: identification.civilite_id,
        code: identification.code,
        fax: identification.fax,
        mobile: identification.mobile,
        actif: identification.actif,
        type: identification.type,
      },
      isIdentificationValidated: true,
    })
  );

  AddOrUpdateContact = this.updater(
    (
      state: ApporteurAffaireState,
      data: { contact: IApporteurAffaireContact; index: number }
    ) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        contacts: state.apporteurAffaireLocal?.contacts?.map(
          (element: IApporteurAffaireContact, index: number) => {
            if (index === data.index) {
              return { ...data.contact };
            }
            return element;
          }
        ),
      },
    })
  );

  RemoveContact = this.updater(
    (state: ApporteurAffaireState, index: number) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        contacts: state.apporteurAffaireLocal?.contacts.filter(
          (_, i: number) => i !== index
        ),
      },
    })
  );

  AddNewContact = this.updater((state: ApporteurAffaireState) => ({
    ...state,
    apporteurAffaireLocal: {
      ...state.apporteurAffaireLocal,
      contacts: [
        new ApporteurAffaireContact(),
        ...(state.apporteurAffaireLocal?.contacts || []),
      ],
    },
  }));

  SetRemiseGlobal = this.updater(
    (state: ApporteurAffaireState, pourcentage_remise: number) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        pourcentage_remise,
      },
    })
  );

  AddTarification = this.updater(
    (state: ApporteurAffaireState, tarification: ITarification) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        prestations:
          state.apporteurAffaireLocal?.prestations?.length > 0
            ? !state.apporteurAffaireLocal?.prestations?.find(
                (tarif: ITarification) =>
                  tarif.prestation_id === tarification.prestation_id
              )
              ? [tarification, ...state.apporteurAffaireLocal?.prestations]
              : state.apporteurAffaireLocal?.prestations?.map(
                  (element: ITarification) => {
                    if (element.prestation_id === tarification.prestation_id) {
                      return { ...tarification };
                    }
                    return element;
                  }
                )
            : [tarification],
      },
    })
  );

  DeleteTarification = this.updater(
    (state: ApporteurAffaireState, tarification: ITarification) => ({
      ...state,
      apporteurAffaireLocal: {
        ...state.apporteurAffaireLocal,
        prestations: state.apporteurAffaireLocal?.prestations?.filter(
          (element: ITarification) =>
            element.prestation_id !== tarification.prestation_id
        ),
      },
    })
  );

  SetApporteursAffaireSearchResponse = (
    apporteurAffaireSearchResponse: PaginatedApiResponse<IApporteurAffaire>
  ) => this.patchState({ apporteurAffaireSearchResponse });

  SetApporteurAffaireLocal = (apporteurAffaireLocal: IApporteurAffaireLocal) =>
    this.patchState({ apporteurAffaireLocal });

  SetApporteurAffaireNational = (
    apporteurAffaireNational: IApporteurAffaireNational
  ) => this.patchState({ apporteurAffaireNational });

  //Effects

  //Recherche d'apporteur d'affaire
  ApporteurAffaireSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.Sort$, this.PageEvent$, this.SearchFormSelector$),
      switchMap(
        ([_, sort, pageEvent, searchForm]: [
          any,
          Sort,
          PageEvent,
          IApporteurAffaireSearchForm
        ]) => {
          const params = this.sharedService.getQuery(
            searchForm,
            pageEvent.pageIndex + 1,
            pageEvent.pageSize,
            sort
          );

          return this.apporteurAffaireService
            .searchApporteurAffaire(params, searchForm.type)
            .pipe(
              tap(
                (
                  apporteurAffaireSearchResponse: PaginatedApiResponse<IApporteurAffaire>
                ) =>
                  this.SetApporteursAffaireSearchResponse(
                    apporteurAffaireSearchResponse
                  )
              ),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'getApporteurAffaireSearchError')
              )
            );
        }
      )
    )
  );

  /**
   * Récupérer les detail de l'apporteur d'affaire local/national
   */
  GetApporteurAffaire = this.effect((trigger$) => {
    return trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        iif(
          () =>
            !!params?.id &&
            (params?.type as TypeApporteurAffaire) ===
              TypeApporteurAffaire.local,
          this.apporteurAffaireService.getDetailsApporteurLocal(params.id).pipe(
            map((apporteurAffaireLocal: IApporteurAffaireLocal) => {
              this.SetApporteurAffaireLocal(apporteurAffaireLocal);
            })
          ),
          this.apporteurAffaireService
            .getDetailsApporteurNational(params.id)
            .pipe(
              map((apporteurAffaireNational: IApporteurAffaireNational) => {
                this.SetApporteurAffaireNational(apporteurAffaireNational);
              })
            )
        ).pipe(
          catchError((error: HttpErrorResponse) => {
            this.router.navigate(['/p/commercial/apporteur-affaire']);
            return this.setWsError(error, 'apporteurNotExist');
          })
        )
      )
    );
  });

  //Ajouteur un apporteur d'affaire
  SaveApporteurAffaire = this.effect((trigger$) => {
    return trigger$.pipe(
      withLatestFrom(this.ApporteurAffaireLocalSelector$),
      switchMap(([_, form]: [any, IApporteurAffaireLocal]) => {
        return this.apporteurAffaireService
          .saveApporteurAffaireLocal(form)
          .pipe(
            tapResponse(
              (_: IApporteurAffaireLocal) => {
                this.toasterService.success(
                  this.translateService.instant('commun.operationTerminee')
                );
                this.ApporteurAffaireSearch();
                this.router.navigate(['/p/commercial/apporteur-affaire']);
              },
              (error: HttpErrorResponse) =>
                this.setWsError(error, 'addApporteurAffaireError', true)
            )
          );
      })
    );
  });

  //Modifier l'identification d'un apporteur d'affaire
  UpdateApporteurAffaire = this.effect(
    (
      trigger$: Observable<{
        apporteurId: number;
        data: { [key: string]: any };
      }>
    ) => {
      return trigger$.pipe(
        switchMap(
          (trigger: { data: { [key: string]: any }; apporteurId: number }) => {
            return this.apporteurAffaireService
              .updateApporteurAffaireLocal(trigger.apporteurId, trigger.data)
              .pipe(
                tapResponse(
                  (apporteurAffaireLocal: IApporteurAffaireLocal) => {
                    this.SetApporteurAffaireLocal(apporteurAffaireLocal);
                    this.toasterService.success(
                      this.translateService.instant('commun.operationTerminee')
                    );
                    this.ApporteurAffaireSearch();
                  },
                  (error: HttpErrorResponse) =>
                    this.setWsError(error, 'updateApporteurAffaireError', true)
                )
              );
          }
        )
      );
    }
  );

  //Ajouter un contact
  AddContactEffect = this.effect(
    (
      trigger$: Observable<{
        contact: IApporteurAffaireContact;
        index: number;
      }>
    ) =>
      trigger$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([trigger, apporteurAffaireLocal]: [
            { contact: IApporteurAffaireContact; index: number },
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .addContactLocal(apporteurAffaireLocal.id, trigger.contact)
              .pipe(
                tap((contact: IApporteurAffaireContact) => {
                  this.AddOrUpdateContact({
                    contact,
                    index: trigger.index,
                  });
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'addContactError', true)
                )
              );
          }
        )
      )
  );

  //Modifier un contact
  UpdateContactExistingApporteur = this.effect(
    (
      trigger$: Observable<{
        contact: { [key: string]: any };
        index: number;
        contactId: number;
      }>
    ) =>
      trigger$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([trigger, apporteurAffaireLocal]: [
            {
              contact: { [key: string]: any };
              index: number;
              contactId: number;
            },
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .updateContactLocal(
                apporteurAffaireLocal.id,
                trigger.contact,
                trigger.contactId
              )
              .pipe(
                tap((contact: IApporteurAffaireContact) => {
                  this.AddOrUpdateContact({
                    contact,
                    index: trigger.index,
                  });
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'updateContactError', true)
                )
              );
          }
        )
      )
  );

  //Supprimer un contact
  DeleteContactEffect = this.effect(
    (contact$: Observable<{ contactId: number; index: number }>) =>
      contact$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([trigger, apporteurAffaireLocal]: [
            { contactId: number; index: number },
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .deleteContactLocal(apporteurAffaireLocal.id, trigger.contactId)
              .pipe(
                tap(() => {
                  this.RemoveContact(trigger.index);
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'deleteContactError', true)
                )
              );
          }
        )
      )
  );

  //Ajouter une tarification
  AddTarificationEffect = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([tarification, apporteurAffaireLocal]: [
            ITarification,
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .addTarification(apporteurAffaireLocal.id, tarification)
              .pipe(
                tap((tarification: ITarification) => {
                  this.AddTarification(tarification);
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'addTarificationError', true)
                )
              );
          }
        )
      )
  );

  //Modifier une tarification
  UpdateTarificationEffect = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([tarification, apporteurAffaireLocal]: [
            ITarification,
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .updateTarification(apporteurAffaireLocal.id, tarification)
              .pipe(
                tap((tarification: ITarification) => {
                  this.AddTarification(tarification);
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'updateTarificationError', true)
                )
              );
          }
        )
      )
  );

  //Supprimer une tarification
  DeleteTarificationEffect = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.ApporteurAffaireLocalSelector$),
        switchMap(
          ([tarification, apporteurAffaireLocal]: [
            ITarification,
            IApporteurAffaireLocal
          ]) => {
            return this.apporteurAffaireService
              .deleteTarification(apporteurAffaireLocal.id, tarification.id)
              .pipe(
                tap(() => {
                  this.DeleteTarification(tarification);
                  this.toasterService.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'deleteTarificationError', true)
                )
              );
          }
        )
      )
  );

  GetApporteursStatistics = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.apporteurAffaireService.getApporteursStatistics().pipe(
          tap((apporteurAffaireStatistics: IApporteurAffaireStatistics) => {
            this.patchState({
              apporteurAffaireStatistics: [
                {
                  class: 'bg-sky-600',
                  value: apporteurAffaireStatistics?.actif_locaux,
                  label: 'commercial.apporteurAffaire.apporteursLocauxActifs',
                },
                {
                  class: 'bg-orange-600',
                  value: apporteurAffaireStatistics?.inactif_locaux,
                  label: 'commercial.apporteurAffaire.apporteursLocauxInactifs',
                },
                {
                  class: 'bg-indigo-600',
                  value: apporteurAffaireStatistics?.total_locaux,
                  label: 'commercial.apporteurAffaire.apporteursLocaux',
                },
                {
                  class: 'bg-teal-600',
                  value: apporteurAffaireStatistics?.total_nationaux,
                  label: 'commercial.apporteurAffaire.apporteursNationaux',
                },
              ],
            });
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getStatisticsError')
          )
        )
      )
    )
  );

  GoToApporteurDetails = this.effect(
    (trigger$: Observable<{ type: string; id: number }>) =>
      trigger$.pipe(
        tap((data: { type: string; id: number }) =>
          this.router.navigate([data?.type, data.id], {
            relativeTo: this.route,
          })
        )
      )
  );

  GoToApporteurLocalAdd = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => this.router.navigate(['local/add'], { relativeTo: this.route }))
    )
  );
}
