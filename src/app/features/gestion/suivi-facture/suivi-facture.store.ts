import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  FactureSearchForm,
  IFactureSearchForm,
} from './components/suivi-facture-search/suivi-facture-search-form/models';
import { IFacture, IWsError, PaginatedApiResponse } from '@app/models';
import { catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SharedService } from '@app/services';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { TranslateService } from '@ngx-translate/core';
import { ExportTypeEnum } from '@app/enums';
import { exportFile, formaterDate } from '@app/helpers';
import { select, Store } from '@ngrx/store';
import { RouterParamsSelector } from '../../../core/store/router/router.selector';
import { AppState } from '../../../core/store/app.state';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IFactureRequest } from '../shared/models';
import { FactureService } from '../../../shared/services/facture.service';

export interface FactureState {
  searchForm: IFactureSearchForm;
  invoices: PaginatedApiResponse<IFacture>;
  selectedFacturesIds: number[];
  facturePdf: string;
  facture: IFacture;
  pageEvent: PageEvent;
  sort: Sort;
  errors: IWsError;
}
export const initialFactureState: FactureState = {
  searchForm: new FactureSearchForm(),
  invoices: new PaginatedApiResponse<IFacture>(),
  selectedFacturesIds: [],
  facturePdf: '',
  facture: null,
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  sort: { active: 'date_facture', direction: 'desc' },
  errors: null,
};

@Injectable()
export class SuiviFactureStore extends ComponentStore<FactureState> {
  // SELECTORS
  invoices$ = this.select((state: FactureState) => state.invoices);
  searchForm$ = this.select((state: FactureState) => state.searchForm);
  pageEvent$ = this.select((state: FactureState) => state.pageEvent);
  sort$ = this.select((state: FactureState) => state.sort);
  selectedFacturesIds$ = this.select(
    (state: FactureState) => state.selectedFacturesIds
  );
  facturePdf$ = this.select((state: FactureState) => state.facturePdf);
  facture$ = this.select((state: FactureState) => state.facture);
  constructor(
    private sharedService: SharedService,
    private invoiceService: FactureService,
    private translateService: TranslateService,
    private store: Store<AppState>,
    private toaster: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(initialFactureState);
  }

  // UPDATERS
  setSearchForm = this.updater(
    (state: FactureState, searchForm: IFactureSearchForm) => ({
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
      selectedFacturesIds: [],
    })
  );

  setPageEvent = (pageEvent: PageEvent) =>
    this.patchState({
      pageEvent,
    });

  setSort = this.updater((state: FactureState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: { ...state.pageEvent, pageIndex: 0 },
  }));

  resetSearchForm = () =>
    this.patchState({
      searchForm: new FactureSearchForm(),
    });

  selectUnselectFacture = this.updater(
    (
      state: FactureState,
      data: { isChecked: boolean; factures: IFacture[] }
    ) => {
      const { isChecked, factures } = data;
      let { selectedFacturesIds } = state;
      factures.forEach((facture: IFacture) => {
        // vérifier si la facture est déja séléctionée
        const exists = selectedFacturesIds.includes(facture.id);
        // Selectionner la facture si elle n'est pas déjà sélectionnée
        if (isChecked && !exists) {
          selectedFacturesIds = [...selectedFacturesIds, facture.id];
        } else if (!isChecked && exists) {
          // Deselectionner la facture si elle est déja sélectionnée
          selectedFacturesIds = selectedFacturesIds.filter(
            (el: number) => el !== facture.id
          );
        }
      });
      return {
        ...state,
        selectedFacturesIds,
      };
    }
  );

  // EFFECTS
  /**
   * Rechercher les factures
   */
  InvoicesSearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$, this.sort$, this.pageEvent$),
      switchMap(
        ([_, searchForm, sort, pageEvent]: [
          any,
          IFactureSearchForm,
          Sort,
          PageEvent
        ]) => {
          const { client, apporteurAffaire, ...invoiceSearchParams } =
            searchForm;
          const params = this.sharedService.getQuery(
            {
              ...invoiceSearchParams,
              ...(client && {
                client_denomination: client.nom,
                client_id: client.id,
              }),
              ...(apporteurAffaire && { mandant: apporteurAffaire.nom }),
            },
            pageEvent.pageIndex + 1,
            pageEvent.pageSize,
            sort
          );
          return this.invoiceService.getInvoices(params).pipe(
            tap((invoices: PaginatedApiResponse<IFacture>) => {
              this.patchState({
                invoices,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              this.patchState({
                errors: this.sharedService.getWsError(
                  error,
                  'gestion.errors.searchError',
                  true
                ),
              });
              return of(error);
            })
          );
        }
      )
    )
  );

  /**
   * Récupérer la facture
   */
  getInvoice = this.effect((trigger$: Observable<{ query?: string }>) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([data, params]: [any, Params]) =>
        this.invoiceService
          .getInvoice(params['idFacture'], data?.query ?? '')
          .pipe(
            tap((facture: IFacture) => {
              this.patchState({
                facture,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              this.patchState({
                facture: null,
                errors: this.sharedService.getWsError(
                  error,
                  'gestion.errors.getInvoiceFileError',
                  true
                ),
              });
              this.goToSearchFactures();
              return of(error);
            })
          )
      )
    )
  );

  /**
   * Exporter les factures xsl et pdf
   */
  invoiceExport = this.effect((typeExport$: Observable<ExportTypeEnum>) =>
    typeExport$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([typeExport, searchForm]: [string, IFactureSearchForm]) => {
        const params = this.sharedService.getQuery({
          ...searchForm,
          file_type: typeExport,
        });
        return this.invoiceService.invoiceExport(params).pipe(
          tap(() =>
            this.toaster.success(
              this.translateService.instant('commun.exportInProgress')
            )
          ),
          catchError((error: HttpErrorResponse) => {
            this.patchState({
              errors: this.sharedService.getWsError(
                error,
                `error.${
                  typeExport === ExportTypeEnum.pdf ? 'exportPdf' : 'exportXls'
                }`,
                true
              ),
            });
            return of(error);
          })
        );
      })
    )
  );

  /**
   * Créer l'avoir
   */
  createAvoir = this.effect((idFacture$: Observable<number>) =>
    idFacture$.pipe(
      switchMap((idFacture: number) =>
        this.invoiceService.createAvoir(idFacture).pipe(
          tap((facture: IFacture) => {
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.goToFacture(facture.id);
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            this.patchState({
              errors: this.sharedService.getWsError(
                errorResponse,
                errorResponse.status === 422
                  ? errorResponse.error.error
                  : 'gestion.errors.createAvoirError',
                true,
                errorResponse.status !== 422
              ),
            });
            return of(errorResponse);
          })
        )
      )
    )
  );

  /**
   * Récupérer le pdf de la facture
   */
  downloadDuplicata = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.invoiceService.getDuplicata(params['idFacture']).pipe(
          tap((response: HttpResponse<Blob>) => {
            exportFile(response);
          }),
          catchError((error: HttpErrorResponse) => {
            this.patchState({
              facturePdf: null,
              errors: this.sharedService.getWsError(
                error,
                'gestion.errors.duplicataError',
                true
              ),
            });
            return of(error);
          })
        )
      )
    )
  );
  getFacturePdf = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.invoiceService.getFacturePdf(params['idFacture']).pipe(
          tap((response: HttpResponse<Blob>) => {
            const pdf = new Blob([response.body], {
              type: 'application/pdf',
            });
            this.patchState({
              facturePdf: URL.createObjectURL(pdf),
            });
          }),
          catchError((error: HttpErrorResponse) => {
            this.patchState({
              facturePdf: null,
              errors: this.sharedService.getWsError(
                error,
                'gestion.errors.getInvoiceFileError',
                true
              ),
            });
            return of(error);
          })
        )
      )
    )
  );

  /**
   * Télécharger la facture
   */
  downloadFacturePdf = this.effect((factureIds$: Observable<number[]>) =>
    factureIds$.pipe(
      switchMap((factureIds: number[]) =>
        this.invoiceService.downloadFacturePdf(factureIds).pipe(
          tap((response: HttpResponse<Blob>) => {
            exportFile(response);
          }),
          catchError((error: HttpErrorResponse) => {
            this.patchState({
              facturePdf: null,
              errors: this.sharedService.getWsError(
                error,
                'gestion.errors.downloadInvoiceError',
                true
              ),
            });
            return of(error);
          })
        )
      )
    )
  );

  /**
   * Envoyer la facture par mail
   */
  sendInvoiceByMail = this.effect(
    (params$: Observable<{ id: number; numero_facture: string }>) =>
      params$.pipe(
        switchMap((params: { id: number; numero_facture: string }) =>
          this.invoiceService.sendEmail(params.id).pipe(
            tap(() => {
              this.toaster.success(
                this.translateService.instant(`gestion.factures.sendFacture`, {
                  value: `${params.numero_facture}`,
                })
              );
            }),
            catchError((error: HttpErrorResponse) => {
              this.patchState({
                errors: this.sharedService.getWsError(
                  error,
                  'gestion.errors.sendEmailError',
                  true
                ),
              });
              return of(error);
            })
          )
        )
      )
  );

  goToFacture = this.effect((idFacture$: Observable<number>) =>
    idFacture$.pipe(
      tap((idFacture: number) =>
        this.router.navigate([idFacture], { relativeTo: this.route })
      )
    )
  );

  goToSearchFactures = this.effect((trigger$) =>
    trigger$.pipe(tap(() => this.router.navigate(['/p/gestion/factures'])))
  );

  refacturer = this.effect((facture$: Observable<IFactureRequest>) =>
    facture$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([facture, params]: [IFactureRequest, Params]) =>
        this.invoiceService.refacturer(params['idFacture'], facture).pipe(
          tap((response: HttpResponse<Blob>) => {
            exportFile(response);
            this.toaster.success(
              this.translateService.instant('commun.operationTerminee')
            );
            this.goToSearchFactures();
          }),
          catchError((error: HttpErrorResponse) => {
            this.patchState({
              errors: this.sharedService.getWsError(
                error,
                'gestion.errors.factError',
                true
              ),
            });
            return of(error);
          })
        )
      )
    )
  );
}
