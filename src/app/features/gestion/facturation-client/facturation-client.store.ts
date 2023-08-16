import {
  FacturationSearchForm,
  IControle,
  IClientControleNonFactures,
  IControleSelection,
  IFacturationSearchForm,
  IGenerateFactureRequest,
  GenerateFactureRequest,
} from './models';
import { ComponentStore } from '@ngrx/component-store';
import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { SharedService } from '@app/services';
import { FacturationClientProService } from './services/facturation-client-pro.service';
import * as moment from 'moment';
import { IWsError, PaginatedApiResponse, WsErrorClass } from '@app/models';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { IFactureRequest } from '../shared/models';
import { exportFile, formaterDate } from '@app/helpers';
import { Router } from '@angular/router';

export interface FacturationClientProState {
  searchForm: IFacturationSearchForm;
  searchResult: PaginatedApiResponse<IClientControleNonFactures>;

  generateFactureRequest: IGenerateFactureRequest;
  pageEvent: PageEvent;
  sort: Sort;
  hasOldUnbilledControls: boolean;
  errors: IWsError;
}

export const initialFacturationClienProState: FacturationClientProState = {
  searchForm: new FacturationSearchForm(),
  searchResult: null,
  generateFactureRequest: new GenerateFactureRequest(),
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  sort: { active: 'date_dernier_controle', direction: 'desc' },
  hasOldUnbilledControls: false,
  errors: new WsErrorClass(),
};
@Injectable()
export class FacturationClientStore extends ComponentStore<FacturationClientProState> {
  searchForm$ = this.select(
    (state: FacturationClientProState) => state.searchForm
  );
  searchResult$ = this.select(
    (state: FacturationClientProState) => state.searchResult
  );
  pageEvent$ = this.select(
    (state: FacturationClientProState) => state.pageEvent
  );
  sort$ = this.select((state: FacturationClientProState) => state.sort);
  generateFactureRequest$ = this.select(
    (state: FacturationClientProState) => state.generateFactureRequest
  );
  selectedClients$ = this.select(
    (state: FacturationClientProState) => state.generateFactureRequest?.clients
  );
  dateFacturation$ = this.select(
    (state: FacturationClientProState) =>
      state.generateFactureRequest?.date_facture
  );
  hasOldUnbilledControls$ = this.select(
    (state: FacturationClientProState) => state.hasOldUnbilledControls
  );
  dateFacturationError$ = this.select(
    (state: FacturationClientProState) => state.errors?.messageToShow
  );
  constructor(
    private sharedService: SharedService,
    private facturationClientProService: FacturationClientProService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private router: Router
  ) {
    super(initialFacturationClienProState);
  }

  // UPDATERS
  setSearchForm = this.updater(
    (state: FacturationClientProState, searchForm: IFacturationSearchForm) => ({
      ...state,
      searchForm: {
        ...searchForm,
        start_date: searchForm.start_date
          ? formaterDate(searchForm.start_date)
          : null,
        end_date: searchForm.end_date
          ? formaterDate(searchForm.end_date)
          : null,
      },
      pageEvent: { ...state.pageEvent, pageIndex: 0 },
    })
  );

  setPageEvent = (pageEvent: PageEvent) =>
    this.patchState({
      pageEvent,
    });

  setDateFacturation = this.updater(
    (state: FacturationClientProState, dateFacturation: string) => ({
      ...state,
      generateFactureRequest: {
        ...state.generateFactureRequest,
        date_facture: dateFacturation,
      },
    })
  );

  setErrors = (errors: IWsError) =>
    this.patchState({
      errors,
    });

  setSort = this.updater((state: FacturationClientProState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  resetSearchForm = () =>
    this.patchState({
      searchForm: new FacturationSearchForm(),
    });

  selectUnselectClient = this.updater(
    (
      state: FacturationClientProState,
      data: { isChecked: boolean; clients: IClientControleNonFactures[] }
    ) => {
      const { isChecked, clients } = data;
      let selectedClients = state.generateFactureRequest.clients;
      clients.forEach((client: IClientControleNonFactures) => {
        // vérifier si le client est déja séléctionée
        const exists = selectedClients.find(
          (el: IControleSelection) => el.client_id === client.id
        );
        // Selectionner le client s'il n'est pas déjà sélectionnée
        if (isChecked && !exists) {
          selectedClients = [
            ...selectedClients,
            {
              client_id: client.id,
              controles_id: client.controles.map((item: IControle) => item.id),
              multi_pv: client.multi_pv,
              email: client.email,
            },
          ];
        } else if (!isChecked && exists) {
          // Desélectionner le client s'il est déja sélectionnée
          selectedClients = selectedClients.filter(
            (el: IControleSelection) => el.client_id !== client.id
          );
        }
      });
      return {
        ...state,
        generateFactureRequest: {
          ...state.generateFactureRequest,
          clients: selectedClients,
        },
      };
    }
  );

  selectUnselectControl = this.updater(
    (
      state: FacturationClientProState,
      data: { isChecked: boolean; selection: IControleSelection }
    ) => {
      const { isChecked, selection } = data;
      let selectedClients = state.generateFactureRequest.clients;
      // Récupérer la selection du client selectionner
      const existingSelection = selectedClients.find(
        (item: IControleSelection) => item.client_id === selection.client_id
      );

      // si le control est selectionner
      if (isChecked) {
        // Ajouter le controle_id à la liste des controle_id de la sélection existante
        if (existingSelection) {
          existingSelection.controles_id.push(...selection.controles_id);
        } else {
          selectedClients = [...selectedClients, selection];
        }
      } else {
        if (existingSelection) {
          existingSelection.controles_id =
            existingSelection.controles_id.filter(
              (el: number) => el !== selection.controles_id[0]
            );
          if (!existingSelection.controles_id.length) {
            selectedClients = selectedClients.filter(
              (el: IControleSelection) => el.client_id !== selection.client_id
            );
          }
        }
      }
      return {
        ...state,
        generateFactureRequest: {
          ...state.generateFactureRequest,
          clients: selectedClients,
        },
      };
    }
  );

  checkUnCheckMultiPvOrEmail = this.updater(
    (
      state: FacturationClientProState,
      data: { field: string; clientId: number }
    ) => {
      const { field, clientId } = data;
      return {
        ...state,
        searchResult: {
          ...state.searchResult,
          data: state.searchResult.data.map(
            (el: IClientControleNonFactures) => {
              if (el.id === clientId) {
                // @ts-ignore
                el[field] = !el[field];
              }
              return el;
            }
          ),
        },
        generateFactureRequest: {
          ...state.generateFactureRequest,
          clients: [
            ...state.generateFactureRequest.clients.map(
              (el: IControleSelection) => {
                if (el.client_id === clientId) {
                  // @ts-ignore
                  el[field] = !el[field];
                }
                return el;
              }
            ),
          ],
        },
      };
    }
  );

  // EFFECTS

  searchControles = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$, this.sort$, this.pageEvent$),
      switchMap(
        ([_, searchForm, sort, pageEvent]: [
          any,
          IFacturationSearchForm,
          Sort,
          PageEvent
        ]) => {
          const { client, ...searchFormParams } = searchForm;
          const params = this.sharedService.getQuery(
            {
              ...searchFormParams,
              ...(client && {
                client_id: client.id,
              }),
            },
            pageEvent.pageIndex + 1,
            pageEvent.pageSize,
            sort
          );
          return this.facturationClientProService
            .searchControleNonFactures(params)
            .pipe(
              tap(
                (
                  searchResult: PaginatedApiResponse<IClientControleNonFactures>
                ) => {
                  // stocker si au moins un contrôle a une date de plus
                  // de deux mois et resultat de recherche.
                  this.patchState({
                    hasOldUnbilledControls: this.hasOldUnbilledControls(
                      searchResult.data
                    ),
                    searchResult,
                  });
                }
              ),
              catchError((error: HttpErrorResponse) => {
                this.setErrors(
                  this.sharedService.getWsError(
                    error,
                    'gestion.errors.searchError',
                    true
                  )
                );
                return of(error);
              })
            );
        }
      )
    )
  );

  getFacturationDate = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return this.facturationClientProService.getFacturationDate().pipe(
          tap((dateFacture: string) => {
            // Si la date de fin de la dernière clôture est supérieure ou égale à la fin du mois précédent,
            // on prend la date en cours.
            // sinon la date fin du mois précedent
            const date = new Date();
            const lastDateOfPreviousMonth = moment(date)
              .subtract(1, 'month')
              .endOf('month')
              .format('YYYY-MM-DD');
            this.setDateFacturation(
              dateFacture >= lastDateOfPreviousMonth
                ? formaterDate(date)
                : lastDateOfPreviousMonth
            );
          }),
          catchError((error: HttpErrorResponse) => {
            this.setErrors(
              this.sharedService.getWsError(error, 'gestion.errors.searchError')
            );
            return of(error);
          })
        );
      })
    )
  );

  generateFacture = this.effect(
    (
      trigger$: Observable<{
        closeDialog: () => void;
      }>
    ) =>
      trigger$.pipe(
        withLatestFrom(this.generateFactureRequest$),
        switchMap(
          ([data, generateFactureRequest]: [any, IGenerateFactureRequest]) => {
            return this.facturationClientProService
              .generateFacture(generateFactureRequest)
              .pipe(
                tap(() => {
                  this.toastrService.success(
                    this.translateService.instant(
                      'gestion.factures.factureGeneration'
                    )
                  );
                  // Fermer la popup et vider la selection clients
                  data.closeDialog();
                  this.patchState({
                    generateFactureRequest: {
                      ...generateFactureRequest,
                      clients: [],
                    },
                  });
                  this.searchControles();
                }),
                catchError((error: HttpErrorResponse) => {
                  const dateFactError =
                    error.status === 422 &&
                    'date_facture' in error.error.errors;
                  this.setErrors(
                    this.sharedService.getWsError(
                      error,
                      dateFactError
                        ? error.error.errors.date_facture[0]
                        : 'gestion.errors.errorGenerationFacture',
                      false,
                      !dateFactError
                    )
                  );
                  return of(error);
                })
              );
          }
        )
      )
  );

  goToSearchFactures = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['/p/gestion/factures'])))
  );

  createFactureDiverse = this.effect((facture$: Observable<IFactureRequest>) =>
    facture$.pipe(
      switchMap((facture: IFactureRequest) =>
        this.facturationClientProService.storeFactureDiverse(facture).pipe(
          tap((response: HttpResponse<Blob>) => {
            exportFile(response);
            this.toastrService.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.goToSearchFactures();
          }),
          catchError((error: HttpErrorResponse) => {
            this.setErrors(
              this.sharedService.getWsError(
                error,
                'gestion.errors.factError',
                true
              )
            );
            return of(error);
          })
        )
      )
    )
  );

  /**
   * Vérifiez s'il existe des prestations non facturées datant de plus 2 mois .
   * @param {IClientControleNonFactures[]} controleNonFactures
   * @return boolean
   */
  hasOldUnbilledControls(
    controleNonFactures: IClientControleNonFactures[]
  ): boolean {
    return controleNonFactures.some((item: IClientControleNonFactures) => {
      return item.controles.some((controle: IControle) => {
        // Récupérer la date du controle
        const dateEdition = new Date(controle.date_edition);
        // Obtenez la date actuelle et soustrayez deux mois
        const dateReference = new Date();
        dateReference.setMonth(dateReference.getMonth() - 2);

        // Vérifiez si la date du contrôle est antérieure à la date de référence
        return dateEdition < dateReference;
      });
    });
  }
}
