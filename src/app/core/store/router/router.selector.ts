import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';
import { IRouterStateUrl } from './router.state';

export const selectRouterState =
  createFeatureSelector<RouterReducerState<IRouterStateUrl>>('router');

export const RouterSelector = createSelector(
  selectRouterState,
  (router: RouterReducerState<IRouterStateUrl>) => router?.state
);
export const RouterUrlSelector = createSelector(
  selectRouterState,
  (router: RouterReducerState<IRouterStateUrl>) => router?.state.url
);

export const RouterParamsSelector = createSelector(
  selectRouterState,
  (router: RouterReducerState<IRouterStateUrl>) => router?.state.params
);

export const RouterQueryParamsSelector = createSelector(
  selectRouterState,
  (router: RouterReducerState<IRouterStateUrl>) => router?.state.queryParams
);
