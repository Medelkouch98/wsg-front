import {
  AdvancedSearchForm,
  DailyActivityCalendarResponse,
  IActivityStatistics,
  IAdvancedSearchForm,
  IDailyActivityCalendarResponse,
  IDisplayOptions,
} from './models';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import {
  PaginatedApiResponse,
  ICurrentUser,
  IWsError,
  WsErrorClass,
  IStatisticCardData,
} from '@app/models';
import { DEFAULT_PAGE_SIZE, DEFAULT_SEARCH_OPTIONS } from '@app/config';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ActivityService } from './services/activity.service';
import { HttpErrorResponse } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import * as authSelectors from '../../core/store/auth/auth.selectors';
import { AppState } from '../../core/store/app.state';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { UsersService } from '../settings/users/services/users.service';

export interface ActivityState {
  dailyActivityCalendar: IDailyActivityCalendarResponse[];
  dailyActivityViewDate: string;
  activityStatistics: IStatisticCardData[];
  advancedSearchForm: IAdvancedSearchForm;
  advancedSearchClicked: boolean;
  activitySearchResponse: PaginatedApiResponse<{
    [key: string]: number | string;
  }>;
  displayOptions: IDisplayOptions[];
  sort: Sort;
  pageEvent: PageEvent;
  errors?: IWsError;
}

export const initialActivityState: ActivityState = {
  dailyActivityCalendar: [new DailyActivityCalendarResponse()],
  dailyActivityViewDate: moment().format('YYYY-MM-DD'),
  activityStatistics: [],
  advancedSearchForm: new AdvancedSearchForm(),
  advancedSearchClicked: false,
  activitySearchResponse: null,
  displayOptions: DEFAULT_SEARCH_OPTIONS,
  sort: { active: '', direction: '' },
  pageEvent: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
  },
  errors: null,
};

@Injectable()
export class ActivityStore extends ComponentStore<ActivityState> {
  // SELECTORS
  DailyActivityCalendarSelector$ = this.select(
    (state: ActivityState) => state.dailyActivityCalendar
  );
  DailyActivityViewDateSelector$ = this.select(
    (state: ActivityState) => state.dailyActivityViewDate
  );
  ActivitySearchResponseSelector$ = this.select(
    (state: ActivityState) => state.activitySearchResponse
  );
  DisplayOptionsSelector$ = this.select(
    (state: ActivityState) => state.displayOptions
  );
  Sort$ = this.select((state: ActivityState) => state.sort);
  PageEvent$ = this.select((state: ActivityState) => state.pageEvent);
  AdvancedSearchFormSelector$ = this.select(
    (state: ActivityState) => state.advancedSearchForm
  );
  advancedSearchClicked$ = this.select(
    (state: ActivityState) => state.advancedSearchClicked
  );
  ActivityStatistic$ = this.select(
    (state: ActivityState) => state.activityStatistics
  );

  constructor(
    private activityService: ActivityService,
    private store: Store<AppState>,
    private translateService: TranslateService,
    private router: Router,
    private usersService: UsersService
  ) {
    super(initialActivityState);
  }

  // UPDATERS
  SetDailyActivityCalendar = (
    dailyActivityCalendar: IDailyActivityCalendarResponse[]
  ) => this.patchState({ dailyActivityCalendar });

  SetDailyActivityViewDate = (dailyActivityViewDate: string) =>
    this.patchState({ dailyActivityViewDate });

  SetActivityStatistics = this.updater((state: ActivityState) => {
    // Calculate the sum of daily activities statictics
    const data = state.dailyActivityCalendar?.reduce(
      (acc: IActivityStatistics, activity: IDailyActivityCalendarResponse) => {
        Object.entries(activity.statistics).forEach(([key, v]) => {
          // @ts-ignore
          acc[key] = v + (acc[key] || 0);
        });
        return acc;
      },
      {} as IActivityStatistics
    );

    // Create statistics cards based on calculated values
    const activityStatistics: IStatisticCardData[] = [
      {
        class: 'bg-fuchsia-700',
        value: data?.nombre_rdv || 0,
        label: 'activity.rdvAgenda',
      },
      {
        class: 'bg-sky-600',
        value: data?.total || 0,
        label: 'activity.controles',
      },
      {
        class: 'bg-indigo-600',
        value: data?.factures || 0,
        label: 'activity.factures',
      },
      {
        class: 'bg-teal-600',
        value: data?.total - data?.factures || 0,
        label: 'activity.nonFactures',
      },
      {
        class: 'bg-orange-600',
        value: data?.regles || 0,
        label: 'activity.regles',
      },
    ];

    return {
      ...state,
      activityStatistics,
    };
  });

  GetActivitySearchResponse = (
    activitySearchResponse: PaginatedApiResponse<{
      [key: string]: number | string;
    }>
  ) => this.patchState({ activitySearchResponse });

  SetWsError = (errors: IWsError) => this.patchState({ errors });

  SetDisplayOptions = (displayOptions: IDisplayOptions[]) =>
    this.patchState({ displayOptions });

  SetSort = this.updater((state: ActivityState, sort: Sort) => ({
    ...state,
    sort,
    pageEvent: {
      ...state.pageEvent,
      pageIndex: 0,
    },
  }));

  SetPageEvent = (pageEvent: PageEvent) => this.patchState({ pageEvent });

  SetAdvancedSearchForm = this.updater(
    (state: ActivityState, advancedSearchForm: AdvancedSearchForm) => ({
      ...state,
      advancedSearchForm,
      pageEvent: {
        ...state.pageEvent,
        pageIndex: 0,
      },
      advancedSearchClicked: true,
    })
  );

  ResetAdvancedSearchForm = () =>
    this.patchState({ advancedSearchForm: new AdvancedSearchForm() });

  //EFFECTS
  GetActivityCalendar = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.DailyActivityViewDateSelector$),
      switchMap(([_, viewDate]: [void, string]) =>
        this.activityService.getDailyActivityCalendar(viewDate).pipe(
          tapResponse(
            (dailyActivityCalendar: IDailyActivityCalendarResponse[]) => {
              this.SetDailyActivityCalendar(dailyActivityCalendar);
              this.SetActivityStatistics();
            },
            (error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.patchState({
                dailyActivityCalendar: [new DailyActivityCalendarResponse()],
              });
              this.SetWsError({
                ...iWsError,
                messageToShow: this.translateService.instant(
                  'activity.errors.getActivityCalendarError'
                ),
              });
            }
          )
        )
      )
    )
  );

  GetDisplayOptions = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(authSelectors.UserSelector))),
      map(([_, user]: [any, ICurrentUser]) => {
        let displayOptions: IDisplayOptions[] = user?.recherche_avancee_options
          ? JSON.parse(user?.recherche_avancee_options)
          : [];
        if (displayOptions.length === 0) {
          displayOptions = DEFAULT_SEARCH_OPTIONS;
          return this.SaveDisplayOptions(displayOptions);
        }
        return this.SetDisplayOptions(displayOptions);
      })
    )
  );

  SaveDisplayOptions = this.effect(
    (displayOptions$: Observable<IDisplayOptions[]>) =>
      displayOptions$.pipe(
        withLatestFrom(this.store.pipe(select(authSelectors.UserSelector))),
        switchMap(([displayOptions, user]: [IDisplayOptions[], ICurrentUser]) =>
          this.usersService
            .updateUser(user.id, {
              recherche_avancee_options: JSON.stringify(displayOptions),
            })
            .pipe(
              tapResponse(
                () => this.SetDisplayOptions(displayOptions),
                (error: HttpErrorResponse) => {
                  const iWsError: IWsError = new WsErrorClass(error);
                  this.SetWsError({
                    ...iWsError,
                    messageToShow: this.translateService.instant(
                      'activity.errors.saveDisplayOptionsError'
                    ),
                  });
                }
              )
            )
        )
      )
  );

  ActivitySearch = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.Sort$,
        this.PageEvent$,
        this.AdvancedSearchFormSelector$
      ),
      switchMap(
        ([_, sort, pageEvent, searchForm]: [
          any,
          Sort,
          PageEvent,
          IAdvancedSearchForm
        ]) => {
          const { client, proprietaire, ...advancedSearchParams } = searchForm;
          let data: IAdvancedSearchForm = {
            ...advancedSearchParams,
            debut_periode: searchForm.debut_periode
              ? moment(searchForm.debut_periode, 'YYYY-MM-DD').format(
                  'YYYY-MM-DD'
                )
              : null,
            fin_periode: searchForm.fin_periode
              ? moment(searchForm.fin_periode, 'YYYY-MM-DD').format(
                  'YYYY-MM-DD'
                )
              : null,
            ...(client && { nom_client: client.nom, client_id: client.id }),
            ...(proprietaire && { nom_proprietaire: proprietaire.nom }),
          };

          return this.activityService
            .searchActivity(
              data,
              pageEvent.pageIndex + 1,
              pageEvent.pageSize,
              sort
            )
            .pipe(
              tapResponse(
                (
                  activitySearchResponse: PaginatedApiResponse<{
                    [key: string]: number | string;
                  }>
                ) => this.GetActivitySearchResponse(activitySearchResponse),
                (error: HttpErrorResponse) => {
                  const iWsError: IWsError = new WsErrorClass(error);
                  this.SetWsError({
                    ...iWsError,
                    messageToShow: this.translateService.instant(
                      'activity.errors.getActivitySearchError'
                    ),
                  });
                }
              )
            );
        }
      )
    )
  );

  SetFormAndSearchByImmat = this.effect((immat$: Observable<string>) =>
    immat$.pipe(
      tap((immat) => {
        const advancedSearchForm = new AdvancedSearchForm();
        advancedSearchForm.debut_periode = null;
        advancedSearchForm.immatriculation = immat;
        this.patchState({ advancedSearchForm });
        this.ActivitySearch();
      })
    )
  );

  // Rediriger vers la fiche controle
  GoToFicheControle = this.effect((idControle$: Observable<number>) =>
    idControle$.pipe(
      tap((idControle: number) =>
        this.router.navigate(['/p/activity/fiche', idControle])
      )
    )
  );
}
