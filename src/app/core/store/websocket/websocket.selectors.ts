import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WebSocketState } from './websocket.reducer';

export const selectWebSocket =
  createFeatureSelector<WebSocketState>('webSocket');

export const EtatsDownloadsSelector = createSelector(
  selectWebSocket,
  (state: WebSocketState) => state.etatsDownloads
);
