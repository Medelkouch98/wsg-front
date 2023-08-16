import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Sort } from '@angular/material/sort';
import { ClientService, SharedService } from '@app/services';
import { PageEvent } from '@angular/material/paginator';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  ClientProContact,
  ClientSearch,
  IClientHistorique,
  IClientProContact,
  IClientProContactRequest,
  IClientSearch,
  IClientStatistics,
  ICreateProspectVehiculeRequest,
  IIdentificationForm,
  IUpdateRelanceRequest,
} from './models';
import {
  Client,
  IClient,
  IStatisticCardData,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { ITarification } from '../tarification/models';
import { ToastrService } from 'ngx-toastr';
import { TypePersonneEnum } from '@app/enums';
import { exportFile } from '@app/helpers';

export interface ClientsState {
  clientsStatistics: IStatisticCardData[];
  clients: PaginatedApiResponse<IClient>;
  searchClicked: boolean;
  searchForm: IClientSearch;
  sort: Sort;
  pageEvent: PageEvent;
  // crud client
  client: IClient;
  isIdentificationValidated: boolean;
  clientHistoriques: IClientHistorique[];
  errors: IWsError;
}

export const initialClientsState: ClientsState = {
  clientsStatistics: [],
  clients: null,
  searchClicked: false,
  searchForm: new ClientSearch(),
  sort: { active: 'actif', direction: 'desc' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  client: new Client(),
  isIdentificationValidated: false,
  clientHistoriques: [],
  errors: null,
};

@Injectable()
export class ClientStore extends ComponentStore<ClientsState> {
  // SELECTORS
  clients$ = this.select((state: ClientsState) => state.clients);
  sort$ = this.select((state: ClientsState) => state.sort);
  searchForm$ = this.select((state: ClientsState) => state.searchForm);
  searchClicked$ = this.select((state: ClientsState) => state.searchClicked);
  pageEvent$ = this.select((state: ClientsState) => state.pageEvent);
  client$ = this.select((state: ClientsState) => state.client);
  soldeClient$ = this.select(
    (state: ClientsState) => state.client.clientPro?.soldeClient
  );
  tarification$ = this.select(
    (state: ClientsState) => state.client.clientPro?.prestations
  );
  contacts$ = this.select(
    (state: ClientsState) => state.client.clientPro?.contacts
  );
  isIdentificationValidated$ = this.select(
    (state: ClientsState) => state.isIdentificationValidated
  );
  historique$ = this.select((state: ClientsState) => state.clientHistoriques);
  clientsStatistics$ = this.select(
    (state: ClientsState) => state.clientsStatistics
  );

  constructor(
    private clientService: ClientService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private toaster: ToastrService,
    private sharedService: SharedService
  ) {
    super(initialClientsState);
  }

  // UPDATERS

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = false
  ) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'client.errors.' + errorMessage
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

  setSort = this.updater((state: ClientsState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  setPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  setSearchForm = this.updater(
    (state: ClientsState, searchForm: IClientSearch) => ({
      ...state,
      searchForm,
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
      searchClicked: true,
    })
  );

  resetSearchForm = () => this.patchState({ searchForm: new ClientSearch() });

  // client add update

  initialiseClient = () =>
    this.patchState({
      client: new Client(),
      isIdentificationValidated: false,
    });

  setIsIdentificationValidated = (isIdentificationValidated: boolean) =>
    this.patchState({ isIdentificationValidated });

  setClientIdentification = this.updater(
    (state: ClientsState, identificationForm: IIdentificationForm) => ({
      ...state,
      client: {
        ...state.client,
        type: identificationForm.type,
        civilite_id: identificationForm.civilite_id,
        nom: identificationForm.nom,
        adresse: identificationForm.adresse,
        suite: identificationForm.suite,
        cp: identificationForm.cp,
        ville: identificationForm.ville,
        fixe: identificationForm.fixe,
        email: identificationForm.email,
        mobile: identificationForm.mobile,
        actif: identificationForm.actif,
        clientPro: {
          ...state.client?.clientPro,
          siret: identificationForm.clientPro.siret,
          code_service: identificationForm.clientPro.code_service,
          fax: identificationForm.clientPro.fax,
        },
      },
      isIdentificationValidated: true,
    })
  );

  patchClientSuccess = this.updater((state: ClientsState, client: IClient) => ({
    ...state,
    client: {
      ...state.client,
      ...client,
      clientPro: {
        ...state.client.clientPro,
        ...client.clientPro,
      },
    },
  }));

  /**
   * Initialiser les données du client pro lors de changement du client pro par un client passage
   * aprés la validation du partie identification
   */
  initDataAfterChangeTypeClient = this.updater(
    (state: ClientsState, type: number) => ({
      ...state,
      client: {
        ...state.client,
        type,
        clientPro: null,
      },
    })
  );

  // Contact client

  addOrUpdateContact = this.updater(
    (
      state: ClientsState,
      data: { contact: IClientProContact; index: number }
    ) => ({
      ...state,
      client: {
        ...state.client,
        clientPro: {
          ...state.client.clientPro,
          contacts: state.client.clientPro?.contacts?.map(
            (element: IClientProContact, index: number) => {
              if (index === data.index) {
                return { ...data.contact };
              }
              return element;
            }
          ),
        },
      },
    })
  );

  addNewContact = this.updater((state: ClientsState) => ({
    ...state,
    client: {
      ...state.client,
      clientPro: {
        ...state.client?.clientPro,
        contacts: [
          new ClientProContact(),
          ...state.client?.clientPro?.contacts,
        ],
      },
    },
  }));

  removeContact = this.updater((state: ClientsState, index: number) => ({
    ...state,
    client: {
      ...state.client,
      clientPro: {
        ...state.client.clientPro,
        contacts: state.client.clientPro.contacts.filter(
          (_, i: number) => i !== index
        ),
      },
    },
  }));

  // Tarification client
  addOrUpdateTarification = this.updater(
    (state: ClientsState, tarification: ITarification) => ({
      ...state,
      client: {
        ...state.client,
        clientPro: {
          ...state.client.clientPro,
          prestations:
            state.client.clientPro?.prestations?.length > 0
              ? !state.client.clientPro?.prestations?.find(
                  (tarif: ITarification) =>
                    tarif.prestation_id === tarification.prestation_id
                )
                ? [tarification, ...state.client.clientPro?.prestations]
                : state.client.clientPro?.prestations?.map(
                    (element: ITarification) => {
                      if (
                        element.prestation_id === tarification.prestation_id
                      ) {
                        return { ...tarification };
                      }
                      return element;
                    }
                  )
              : [tarification],
        },
      },
    })
  );

  removeTarification = this.updater(
    (state: ClientsState, tarification: ITarification) => ({
      ...state,
      client: {
        ...state.client,
        clientPro: {
          ...state.client.clientPro,
          prestations: state.client.clientPro.prestations.filter(
            (element: ITarification) =>
              element.prestation_id !== tarification.prestation_id
          ),
        },
      },
    })
  );

  addOrUpdateHistorique = this.updater(
    (state: ClientsState, clientHistorique: IClientHistorique) => ({
      ...state,
      clientHistoriques: !state.clientHistoriques?.find(
        (row: IClientHistorique) => row.id === clientHistorique.id
      )
        ? [clientHistorique, ...state.clientHistoriques]
        : state.clientHistoriques?.map((row: IClientHistorique) => {
            if (row.id === clientHistorique.id) {
              return { ...clientHistorique };
            }
            return row;
          }),
    })
  );

  // EFFECTS
  clientsSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.sort$, this.searchForm$, this.pageEvent$),
      switchMap(([_, sort, searchForm, pageEvent]) => {
        const query = this.sharedService.getQuery(
          searchForm,
          pageEvent.pageIndex + 1,
          pageEvent.pageSize,
          sort
        );
        return this.clientService.searchClients(query).pipe(
          tap((clients: PaginatedApiResponse<IClient>) =>
            this.patchState({ clients })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'searchClientsError')
          )
        );
      })
    )
  );

  goToClients = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['/p/commercial/client'])))
  );

  goToAddClient = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => this.router.navigate(['add'], { relativeTo: this.route }))
    )
  );

  goToDetailClient = this.effect((idclient$: Observable<number>) =>
    idclient$.pipe(
      tap((idclient: number) =>
        this.router.navigate([idclient], { relativeTo: this.route })
      )
    )
  );

  getClient = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.clientService.getClient(params['idclient']).pipe(
          tap((client: IClient) => {
            this.patchState({ client });
            if (client.type === TypePersonneEnum.PASSAGE) {
              this.getHistorique(params['idclient']);
            }
          }),
          catchError((error: HttpErrorResponse) => {
            this.goToClients();
            return this.setWsError(error, 'clientInfosFicheError');
          })
        )
      )
    )
  );

  addClientProPrestationExistingClient = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([tarification, params]: [ITarification, Params]) =>
          this.clientService
            .addClientProPrestation(tarification, params['idclient'])
            .pipe(
              tap((tarification: ITarification) => {
                this.addOrUpdateTarification(tarification);
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'addPrestationError', true)
              )
            )
        )
      )
  );

  updateClientProPrestationExistingClient = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([tarification, params]: [ITarification, Params]) =>
          this.clientService
            .updateClientProPrestation(
              tarification,
              params['idclient'],
              tarification.id
            )
            .pipe(
              tap((tarification: ITarification) => {
                this.addOrUpdateTarification(tarification);
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'updatePrestationError', true)
              )
            )
        )
      )
  );

  deleteClientProPrestation = this.effect(
    (tarification$: Observable<ITarification>) =>
      tarification$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([tarification, params]: [ITarification, Params]) =>
          this.clientService
            .deleteClientProPrestation(params['idclient'], tarification.id)
            .pipe(
              tap(() => {
                this.removeTarification(tarification);
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'deletePrestationError', true)
              )
            )
        )
      )
  );

  addContactExistingClient = this.effect(
    (contact$: Observable<IClientProContactRequest>) =>
      contact$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([data, params]: [IClientProContactRequest, Params]) =>
          this.clientService
            .addClientProContact(
              data.contact as IClientProContact,
              params['idclient']
            )
            .pipe(
              tap((contact: IClientProContact) => {
                this.addOrUpdateContact({
                  contact,
                  index: data.index,
                });
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'addContactError', true)
              )
            )
        )
      )
  );

  updateContactExistingClient = this.effect(
    (contact$: Observable<IClientProContactRequest>) =>
      contact$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([data, params]: [IClientProContactRequest, Params]) =>
          this.clientService
            .updateClientProContact(
              data.contact,
              params['idclient'],
              data.clientProContactId
            )
            .pipe(
              tap((contact: IClientProContact) => {
                this.addOrUpdateContact({
                  contact,
                  index: data.index,
                });
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'updateContactError', true)
              )
            )
        )
      )
  );

  deleteContactExistingClient = this.effect(
    (contact$: Observable<IClientProContactRequest>) =>
      contact$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([data, params]: [IClientProContactRequest, Params]) =>
          this.clientService
            .deleteClientProContact(params['idclient'], data.clientProContactId)
            .pipe(
              tap(() => {
                this.removeContact(data.index);
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'deleteContactError', true)
              )
            )
        )
      )
  );

  addClient = this.effect((client$: Observable<IClient>) =>
    client$.pipe(
      switchMap((client: IClient) =>
        this.clientService.addClient(client).pipe(
          tap((_: IClient) => {
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.clientsSearch();
            this.goToClients();
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'clientAddError', true)
          )
        )
      )
    )
  );

  updateClient = this.effect(
    (
      client$: Observable<{
        idclient: number;
        data: { [key: string]: any };
      }>
    ) =>
      client$.pipe(
        switchMap(
          (client: { idclient: number; data: { [key: string]: any } }) =>
            this.clientService.updateClient(client.idclient, client.data).pipe(
              tap((client: IClient) => {
                this.patchClientSuccess(client);
                this.clientsSearch();
                this.toaster.success(
                  this.translateService.instant('commun.operationTerminee')
                );
              }),
              catchError((error: HttpErrorResponse) =>
                this.setWsError(error, 'clientUpdateError', true)
              )
            )
        )
      )
  );

  exportCsvClient = this.effect((searchForm$: Observable<IClientSearch>) =>
    searchForm$.pipe(
      switchMap((searchForm: IClientSearch) => {
        const query = this.sharedService.getSearchQuery(searchForm);
        return this.clientService.exportClientCsv(query).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'exportCsvError', true)
          )
        );
      })
    )
  );

  getHistorique = this.effect((idclient$: Observable<number>) =>
    idclient$.pipe(
      switchMap((idclient: number) =>
        this.clientService.getHistorique(idclient).pipe(
          tap((clientHistoriques: IClientHistorique[]) => {
            this.patchState({
              clientHistoriques,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getHistoriqueError', true)
          )
        )
      )
    )
  );

  addProspectVehicule = this.effect(
    (prospectVehicule$: Observable<ICreateProspectVehiculeRequest>) =>
      prospectVehicule$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(
          ([vehicule, params]: [ICreateProspectVehiculeRequest, Params]) =>
            this.clientService
              .addProspectVehicule(vehicule, params['idclient'])
              .pipe(
                tap((clientHistorique: IClientHistorique) => {
                  this.addOrUpdateHistorique(clientHistorique);
                  this.toaster.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'addProspectVehiculeError', true)
                )
              )
        )
      )
  );

  updateRelance = this.effect(
    (trigger$: Observable<{ id: number; data: IUpdateRelanceRequest }>) =>
      trigger$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(
          ([trigger, params]: [
            { id: number; data: IUpdateRelanceRequest },
            Params
          ]) =>
            this.clientService
              .updateRelance(trigger.data, params['idclient'], trigger.id)
              .pipe(
                tap((clientHistorique: IClientHistorique) => {
                  this.addOrUpdateHistorique(clientHistorique);
                  this.toaster.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                }),
                catchError((error: HttpErrorResponse) =>
                  this.setWsError(error, 'updateRelanceError', true)
                )
              )
        )
      )
  );

  goToFicheControle = this.effect((idcontrole$: Observable<number>) =>
    idcontrole$.pipe(
      tap((idcontrole: number) => {
        this.sharedService.redirectToNewTab(['/p/activity/fiche', idcontrole]);
      })
    )
  );

  getClientsStatistics = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.clientService.getClientsStatistics().pipe(
          tap((clientsStatistics: IClientStatistics) =>
            this.patchState({
              clientsStatistics: [
                {
                  class: 'bg-sky-600',
                  value: clientsStatistics?.actif,
                  label: 'client.clientsActifs',
                },
                {
                  class: 'bg-indigo-600',
                  value: clientsStatistics?.pro,
                  label: 'client.clientsCompte',
                },
                {
                  class: 'bg-teal-600',
                  value: clientsStatistics?.passage,
                  label: 'client.clientsPassage',
                },
                {
                  class: 'bg-orange-600',
                  value: clientsStatistics?.inactif,
                  label: 'client.clientsInactifs',
                },
              ],
            })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getClientsStatisticsError')
          )
        )
      )
    )
  );

  deleteProspect = this.effect((trigger$: Observable<{ id: number }>) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([trigger, params]: [{ id: number }, Params]) =>
        this.clientService
          .deleteProspectVehicule(params['idclient'], trigger.id)
          .pipe(
            tap(() => {
              this.getHistorique(params['idclient']);
              this.toaster.success(
                this.translateService.instant('commun.operationTerminee')
              );
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'deleteProspectError', true)
            )
          )
      )
    )
  );
}
