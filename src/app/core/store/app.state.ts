import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { IRouterStateUrl } from './router/router.state';
import { settingsReducer, SettingsState } from './settings/settings.reducers';
import { authReducer, AuthState } from './auth/auth.reducer';
import { initStateFromLocalStorage } from './meta-reducers/initStateFromLocalStorage.metareducer';
import {
  resourcesReducer,
  ResourcesState,
} from './resources/resources.reducer';
import {
  websocketReducer,
  WebSocketState,
} from './websocket/websocket.reducer';

export interface AppState {
  router: RouterReducerState<IRouterStateUrl>;
  resources: ResourcesState;
  settings: SettingsState;
  auth: AuthState;
  webSocket: WebSocketState;
}

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  resources: resourcesReducer,
  settings: settingsReducer,
  auth: authReducer,
  webSocket: websocketReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [
  initStateFromLocalStorage,
];
