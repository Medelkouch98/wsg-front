import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { tap, withLatestFrom } from 'rxjs/operators';
import * as webSocketActions from './websocket.actions';
import * as webSocketSelectors from './websocket.selectors';
import { LocalStorageService } from '../../storage/localStorage.service';
import { LOCAL_STORAGE_KEYS } from '@app/config';
import { WebSocketState } from './websocket.reducer';

@Injectable()
export class WebSocketEffects {
  constructor(private actions$: Actions, private store: Store<AppState>) {}

  SaveEtatDownloadEffect = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          webSocketActions.AddEtatDownload,
          webSocketActions.UpdateEtatDownload,
          webSocketActions.DeleteEtatDownload
        ),
        withLatestFrom(
          this.store.pipe(select(webSocketSelectors.selectWebSocket))
        ),
        tap(([, webSocketState]: [any, WebSocketState]) =>
          LocalStorageService.setItem(
            LOCAL_STORAGE_KEYS.webSocket,
            webSocketState
          )
        )
      );
    },
    { dispatch: false }
  );
}
