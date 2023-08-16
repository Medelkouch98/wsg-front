import { Action, createReducer, on } from '@ngrx/store';
import * as featureActions from './websocket.actions';
import { DownloadsInProgress } from '@app/models';

export interface WebSocketState {
  etatsDownloads: DownloadsInProgress[];
}

// Here is the initial state set if no changes happened
export const initialWebSocketState: WebSocketState = {
  etatsDownloads: [],
};

const featureReducer = createReducer(
  initialWebSocketState,
  on(featureActions.AddEtatDownload, (state, action) => ({
    ...state,
    etatsDownloads: [...state.etatsDownloads, action.etatDownload],
  })),
  on(featureActions.UpdateEtatDownload, (state, action) => ({
    ...state,
    etatsDownloads: state.etatsDownloads.map(
      (downloadsInProgress: DownloadsInProgress) => {
        if (downloadsInProgress.uuid === action.uuid) {
          downloadsInProgress = {
            ...downloadsInProgress,
            progress: action.progress,
          };
        }
        return downloadsInProgress;
      }
    ),
  })),
  on(featureActions.DeleteEtatDownload, (state, action) => ({
    ...state,
    etatsDownloads: state.etatsDownloads.filter(
      (downloadsInProgress) => downloadsInProgress.uuid !== action.uuid
    ),
  })),
  on(featureActions.InitializeWebsocketState, () => ({
    ...initialWebSocketState,
  }))
);

export function websocketReducer(
  state: WebSocketState | undefined,
  action: Action
): WebSocketState {
  return featureReducer(state, action);
}
