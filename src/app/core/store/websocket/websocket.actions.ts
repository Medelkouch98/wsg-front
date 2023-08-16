import { createAction, props } from '@ngrx/store';
import { DownloadsInProgress } from '@app/models';

export const AddEtatDownload = createAction(
  '[WebSocket] Add Etat Download',
  props<{ etatDownload: DownloadsInProgress }>()
);

export const UpdateEtatDownload = createAction(
  '[WebSocket] Update Etat Download',
  props<{ uuid: string; progress: number }>()
);
export const DeleteEtatDownload = createAction(
  '[WebSocket] Delete Etat Download',
  props<{ uuid: string }>()
);
export const InitializeWebsocketState = createAction(
  '[Auth] Initialize Websocket State'
);
