import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '@app/services';
import {
  IStatisticsSearch,
  StatisticsSearch,
  IContreVisiteStatisticsResponse,
  IControlStatisticsResponse,
  IStatisticsEntity,
  IAverageDurationStatisticsResponse,
  IDefectStatisticsResponse,
} from './models';
import { IWsError, WsErrorClass, ICentre, IControleur } from '@app/models';
import { StatisticsService } from './services/statistics.service';
import {
  Observable,
  of,
  combineLatest,
  iif,
  catchError,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AppState } from 'app/core/store/app.state';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { exportFile } from '@app/helpers';
import {
  StatisticsEntityTypeEnum,
  StatisticsModuleEnum,
  StatisticsTypeEnum,
} from './enum';
import { UserCurrentCentreSelector } from '../../../core/store/auth/auth.selectors';

export interface StatisticsState {
  controlStatistics: { [agrement: string]: IControlStatisticsResponse[] };
  contreVisiteStatistics: {
    [agrement: string]: IContreVisiteStatisticsResponse[];
  };
  averageDurationStatistics: {
    [agrement: string]: IAverageDurationStatisticsResponse[];
  };
  defectStatistics: {
    [agrement: string]: IDefectStatisticsResponse[];
  };
  entities: IStatisticsEntity[];
  searchForm: IStatisticsSearch;
  searchClicked: boolean;
  selectedStatisticsModule: StatisticsModuleEnum;
  statisticsErrors: {
    [agrement: string]: StatisticsTypeEnum;
  };
  errors: IWsError;
}

export const initialStatisticsState: StatisticsState = {
  controlStatistics: {},
  contreVisiteStatistics: {},
  averageDurationStatistics: {},
  defectStatistics: {},
  entities: null,
  searchForm: new StatisticsSearch(),
  searchClicked: false,
  selectedStatisticsModule: null,
  statisticsErrors: {},
  errors: null,
};

@Injectable()
export class StatisticsStore extends ComponentStore<any> {
  // SELECTORS
  searchForm$: Observable<IStatisticsSearch> = this.select(
    (state: StatisticsState) => state.searchForm
  );

  searchClicked$ = this.select((state: StatisticsState) => state.searchClicked);

  selectedStatisticsModule$: Observable<StatisticsModuleEnum> = this.select(
    (state: StatisticsState) => state.selectedStatisticsModule
  );

  entities$: Observable<IStatisticsEntity[]> = this.select(
    (state: StatisticsState) => state.entities
  );

  controlStatistics$(
    agrement: string
  ): Observable<IControlStatisticsResponse[]> {
    return this.getStatistics$(agrement, 'controlStatistics');
  }

  contreVisiteStatistics$(
    agrement: string
  ): Observable<IContreVisiteStatisticsResponse[]> {
    return this.getStatistics$(agrement, 'contreVisiteStatistics');
  }

  averageDurationStatistics$(
    agrement: string
  ): Observable<IAverageDurationStatisticsResponse[]> {
    return this.getStatistics$(agrement, 'averageDurationStatistics');
  }

  defectStatistics$(agrement: string): Observable<IDefectStatisticsResponse[]> {
    return this.getStatistics$(agrement, 'defectStatistics');
  }

  statisticsErrors$(agrement: string): Observable<StatisticsTypeEnum> {
    return this.getStatistics$(agrement, 'statisticsErrors');
  }

  constructor(
    private statisticsService: StatisticsService,
    private translateService: TranslateService,
    private sharedService: SharedService,

    private toaster: ToastrService,
    private store: Store<AppState>
  ) {
    super(initialStatisticsState);
  }

  /**
   * Sets the search form criteria for the statistics and related properties in the state.
   *
   * @param {IStatisticsSearch} searchForm - The new search criteria to apply.
   */
  public setSearchForm = (searchForm: IStatisticsSearch) =>
    this.patchState({
      searchForm,
      selectedStatisticsModule: searchForm.module,
      controlStatistics: {},
      contreVisiteStatistics: {},
      averageDurationStatistics: {},
      defectStatistics: {},
      statisticsErrors: {},
      searchClicked: true,
    });

  public resetSearchForm = () =>
    this.patchState({ searchForm: new StatisticsSearch() });

  public setControlStatistics = this.updater(
    (
      state: StatisticsState,
      data: {
        agrement: string;
        controlStatistics: IControlStatisticsResponse[];
      }
    ) => {
      return {
        ...state,
        controlStatistics: {
          ...state.controlStatistics,
          [data.agrement]: data.controlStatistics,
        },
      };
    }
  );

  public setContreVisiteStatistics = this.updater(
    (
      state: StatisticsState,
      data: {
        agrement: string;
        contreVisiteStatistics: IContreVisiteStatisticsResponse[];
      }
    ) => {
      return {
        ...state,
        contreVisiteStatistics: {
          ...state.contreVisiteStatistics,
          [data.agrement]: data.contreVisiteStatistics,
        },
      };
    }
  );

  public setAverageDurationStatistics = this.updater(
    (
      state: StatisticsState,
      data: {
        agrement: string;
        averageDurationStatistics: IAverageDurationStatisticsResponse[];
      }
    ) => {
      return {
        ...state,
        averageDurationStatistics: {
          ...state.averageDurationStatistics,
          [data.agrement]: data.averageDurationStatistics,
        },
      };
    }
  );

  public setDefectStatistics = this.updater(
    (
      state: StatisticsState,
      data: {
        agrement: string;
        defectStatistics: IDefectStatisticsResponse[];
      }
    ) => {
      return {
        ...state,
        defectStatistics: {
          ...state.defectStatistics,
          [data.agrement]: data.defectStatistics,
        },
      };
    }
  );

  public setStatisticsErrors = this.updater(
    (
      state: StatisticsState,
      data: {
        agrement: string;
        statisticsErrors: StatisticsTypeEnum;
      }
    ) => {
      return {
        ...state,
        statisticsErrors: {
          ...state.statisticsErrors,
          [data.agrement]: data.statisticsErrors,
        },
      };
    }
  );

  public resetStatisticsErrors = () =>
    this.patchState({ statisticsErrors: {} });

  private setWsError = (error: HttpErrorResponse, errorMessage: string) => {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = this.translateService.instant(
      'statistics.errors.' + errorMessage
    );
    this.patchState({ errors: { ...iWsError, messageToShow } });
    this.toaster.error(messageToShow);
    return of(error);
  };

  // EFFECTS
  public getEntities = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.searchForm$),
      switchMap(([_, searchForm]) => {
        const controleurQuery = this.sharedService.getQuery(searchForm);
        return combineLatest([
          this.store.pipe(select(UserCurrentCentreSelector)),
          this.statisticsService.getStatisticsControleurs(controleurQuery),
        ]).pipe(
          tap(([center, controleurs]: [ICentre, IControleur[]]) => {
            const centerEntity: IStatisticsEntity = {
              name: `${this.translateService.instant('commun.center')} ${
                center.ville
              }`,
              description: center.agrement,
              agrement: center.agrement,
              icon: 'store_mall_directory',
              inactif: !center.actif,
              type: StatisticsEntityTypeEnum.Centre,
            };

            const activityRecapEntity: IStatisticsEntity = {
              name: this.translateService.instant('statistics.recapTitle'),
              agrement: 'Recap',
              icon: 'summarize',
              type: StatisticsEntityTypeEnum.Recap,
            };

            const controleursEntity: IStatisticsEntity[] = controleurs.map(
              (controleur: IControleur) =>
                ({
                  name: controleur.nom,
                  description: controleur.agrement_vl,
                  agrement: controleur.agrement_vl,
                  icon: 'perm_identity',
                  inactif: !controleur.actif,
                  type: StatisticsEntityTypeEnum.Controleur,
                } satisfies IStatisticsEntity)
            );

            let entities: IStatisticsEntity[] = [...controleursEntity];

            // show recap data in activity only if there more than one controller
            if (
              searchForm.module === StatisticsModuleEnum.Activity &&
              controleursEntity.length > 1
            ) {
              entities.unshift(activityRecapEntity);
            }

            // show center data only if there controllers
            if (controleursEntity.length) {
              entities.unshift(centerEntity);
            }
            this.patchState({ entities });
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getControleursError')
          )
        );
      })
    )
  );

  public getControlStatistics = this.effect(
    (entity$: Observable<IStatisticsEntity>) =>
      entity$.pipe(
        withLatestFrom(this.searchForm$),
        switchMap(
          ([{ agrement, type }, searchForm]: [
            IStatisticsEntity,
            IStatisticsSearch
          ]) => {
            const query = this.sharedService.getQuery({
              ...searchForm,
              ...(type === StatisticsEntityTypeEnum.Controleur && {
                agrement_vl: agrement,
              }),
            });

            return iif(
              () => type === StatisticsEntityTypeEnum.Recap,
              this.statisticsService.searchControlStatisticsRecap(query),
              this.statisticsService.searchControlStatistics(query)
            ).pipe(
              tap((controlStatistics: IControlStatisticsResponse[]) => {
                this.setControlStatistics({ agrement, controlStatistics });
              }),
              catchError((error: HttpErrorResponse) => {
                this.setStatisticsErrors({
                  agrement,
                  statisticsErrors: StatisticsTypeEnum.Control,
                });
                return this.setWsError(error, 'getControlStatistics');
              })
            );
          }
        )
      )
  );

  public getContreVisiteStatistics = this.effect(
    (entity$: Observable<IStatisticsEntity>) =>
      entity$.pipe(
        withLatestFrom(this.searchForm$),
        switchMap(
          ([{ agrement, type }, searchForm]: [
            IStatisticsEntity,
            IStatisticsSearch
          ]) => {
            const query = this.sharedService.getQuery({
              ...searchForm,
              ...(type === StatisticsEntityTypeEnum.Controleur && {
                agrement_vl: agrement,
              }),
            });
            return this.statisticsService
              .searchContreVisiteStatistics(query)
              .pipe(
                tap(
                  (
                    contreVisiteStatistics: IContreVisiteStatisticsResponse[]
                  ) => {
                    this.setContreVisiteStatistics({
                      agrement,
                      contreVisiteStatistics,
                    });
                  }
                ),
                catchError((error: HttpErrorResponse) => {
                  this.setStatisticsErrors({
                    agrement,
                    statisticsErrors: StatisticsTypeEnum.ContreVisite,
                  });
                  return this.setWsError(error, 'getContreVisiteStatistics');
                })
              );
          }
        )
      )
  );

  public getAverageDurationStatistics = this.effect(
    (entity$: Observable<IStatisticsEntity>) =>
      entity$.pipe(
        withLatestFrom(this.searchForm$),
        switchMap(
          ([{ agrement, type }, searchForm]: [
            IStatisticsEntity,
            IStatisticsSearch
          ]) => {
            const query = this.sharedService.getQuery({
              ...searchForm,
              ...(type === StatisticsEntityTypeEnum.Controleur && {
                agrement_vl: agrement,
              }),
            });
            return this.statisticsService
              .searchAverageDurationStatistics(query)
              .pipe(
                tap(
                  (
                    averageDurationStatistics: IAverageDurationStatisticsResponse[]
                  ) => {
                    this.setAverageDurationStatistics({
                      agrement,
                      averageDurationStatistics,
                    });
                  }
                ),
                catchError((error: HttpErrorResponse) => {
                  this.setStatisticsErrors({
                    agrement,
                    statisticsErrors: StatisticsTypeEnum.AverageDuration,
                  });
                  return this.setWsError(error, 'getAverageDurationStatistics');
                })
              );
          }
        )
      )
  );

  public getDefectStatistics = this.effect(
    (entity$: Observable<IStatisticsEntity>) =>
      entity$.pipe(
        withLatestFrom(this.searchForm$),
        switchMap(
          ([{ agrement, type }, searchForm]: [
            IStatisticsEntity,
            IStatisticsSearch
          ]) => {
            const query = this.sharedService.getQuery({
              ...searchForm,
              ...(type === StatisticsEntityTypeEnum.Controleur && {
                agrement_vl: agrement,
              }),
            });
            return this.statisticsService.searchDefectStatistics(query).pipe(
              tap((defectStatistics: IDefectStatisticsResponse[]) => {
                this.setDefectStatistics({ agrement, defectStatistics });
              }),
              catchError((error: HttpErrorResponse) => {
                this.setStatisticsErrors({
                  agrement,
                  statisticsErrors: StatisticsTypeEnum.Defect,
                });
                return this.setWsError(error, 'getDefectStatistics');
              })
            );
          }
        )
      )
  );

  public exportStatistics = this.effect(
    (searchForm$: Observable<IStatisticsSearch>) =>
      searchForm$.pipe(
        switchMap((searchForm: IStatisticsSearch) => {
          const query = this.sharedService.getSearchQuery(searchForm);
          return this.statisticsService.exportStatistics(query).pipe(
            tap((resp: HttpResponse<Blob>) => exportFile(resp)),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, `export.${searchForm.type}`)
            )
          );
        })
      )
  );

  /**
   * getStatistics$ returns an Observable of the statistics data for a given `agrement` and `statisticsType`.
   *
   * @param {string} agrement - The agreement.
   * @param {keyof StatisticsState} statisticsType - The type of statistics to retrieve.
   *
   * @returns {Observable<any>} - An Observable of the requested statistics data.
   */
  private getStatistics$(
    agrement: string,
    statisticsType: keyof StatisticsState
  ): Observable<any> {
    return this.select((state: StatisticsState) => state[statisticsType]).pipe(
      filter((statistics: any) => agrement in statistics),
      map((statistics: any) => statistics[agrement])
    );
  }
}
