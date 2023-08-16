import { Action, ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { AppState } from '../app.state';
import { LocalStorageService } from '../../storage/localStorage.service';
import { LOCAL_STORAGE_KEYS } from '@app/config';

export function initStateFromLocalStorage(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return (state: AppState | undefined, action: Action) => {
    let newState = reducer(state, action);
    if ([INIT.toString(), UPDATE.toString()].includes(action.type)) {
      newState = {
        ...newState,
        settings: {
          ...newState.settings,
          ...LocalStorageService.getItem(LOCAL_STORAGE_KEYS.settings),
          loading: newState.settings.loading,
        },
        auth: {
          ...newState.auth,
          ...LocalStorageService.getItem(LOCAL_STORAGE_KEYS.auth),
        },
        webSocket: {
          ...newState.webSocket,
          ...LocalStorageService.getItem(LOCAL_STORAGE_KEYS.webSocket),
        },
      };
    }
    return newState;
  };
}
