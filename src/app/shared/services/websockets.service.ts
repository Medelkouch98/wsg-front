import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  Subject,
  Observable,
  tap,
  map,
  switchMap,
  retry,
  takeUntil,
  BehaviorSubject,
  merge,
  catchError,
  of,
  interval,
} from 'rxjs';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  SessionIDSelector,
  UserSelector,
} from '../../core/store/auth/auth.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.state';
import {
  DownloadsInProgress,
  ICurrentUser,
  WebsocketExportDataResponse,
} from '@app/models';
import { filter, finalize, withLatestFrom } from 'rxjs/operators';
import { ExportEtatsService } from './export-etats.service';
import { EtatsDownloadsSelector } from '../../core/store/websocket/websocket.selectors';
import * as moment from 'moment';
import { DeleteEtatDownload } from '../../core/store/websocket/websocket.actions';

@Injectable()
export class WebsocketsService {
  private webSocket$: WebSocketSubject<any>;
  private channels: { [key: string]: Observable<any> } = {};
  private unsubscribe$ = new Subject<void>();
  private socketId$: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );

  constructor(
    private http: HttpClient,
    private store: Store<AppState>,
    private fileService: ExportEtatsService
  ) {
    this.connect();
    // Delete downloads with a duration exceeding 15 minutes from the current moment
    interval(600000)
      .pipe(
        takeUntil(this.unsubscribe$),
        withLatestFrom(this.store.select(EtatsDownloadsSelector)),
        map(([, etats]: [number, DownloadsInProgress[]]) => {
          const now = moment();
          return etats.filter((etat: DownloadsInProgress) => {
            const differenceEnMinutes = now.diff(etat.date, 'minutes');
            return differenceEnMinutes > 15;
          });
        }),
        tap((expiredDownloads: DownloadsInProgress[]) =>
          expiredDownloads?.forEach((etat: DownloadsInProgress) => {
            this.store.dispatch(DeleteEtatDownload({ uuid: etat.uuid }));
          })
        )
      )
      .subscribe();
  }

  /**
   * connects to the WebSocket server.
   */
  connect() {
    if (!this.webSocket$) {
      this.webSocket$ = webSocket({
        url: `${environment.websocketUrl}web-api-2023-key`,
      });

      this.webSocket$
        .pipe(
          tap((m: any) => {
            const socket_id = m?.data && JSON.parse(m?.data)?.socket_id;
            if (!!socket_id) {
              this.socketId$.next(socket_id);
            }
          }),
          takeUntil(this.unsubscribe$),
          retry({ count: Infinity, delay: 5000 })
        )
        .subscribe({
          error: (error) => {
            console.log('WebSocket closed with error: ', error);
            this.connect();
          },
          complete: () => {
            console.log('WebSocket completed');
          },
        });

      this.socketId$
        .pipe(
          filter((s: string) => !!s),
          withLatestFrom(
            this.store.select(UserSelector),
            this.store.select(SessionIDSelector)
          ),
          takeUntil(this.unsubscribe$),
          switchMap(
            ([socket_id, user, sessionsId]: [string, ICurrentUser, string]) =>
              merge(
                this.createPrivateChannel(
                  socket_id,
                  `private-private.job-status.${user?.id}.${sessionsId}`
                ).pipe(
                  map(
                    (response: any) =>
                      response?.data && JSON.parse(response?.data)
                  ),
                  filter((data: WebsocketExportDataResponse) => !!data),
                  switchMap((data: WebsocketExportDataResponse) =>
                    this.fileService.downloadWebsocketExportData(data)
                  )
                )
              ).pipe(catchError((e) => of(e)))
          )
        )
        .subscribe();
    }
    interval(20000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.sendHeartbeat();
      });
  }

  sendHeartbeat() {
    if (this.webSocket$) {
      this.webSocket$.next('heartbeat');
    }
  }

  /**
   * Creates a private channel with the given name, if it does not already exist.
   * @param socket_id The socket Id.
   * @param channel The name of the channel to create.
   * @returns An Observable that emits messages received on the channel.
   */
  createPrivateChannel(socket_id: string, channel: string): any {
    if (this.channels[channel]) {
      return this.channels[channel];
    }
    return this.getAuthKey(socket_id, channel).pipe(
      switchMap((auth: string) => {
        const PrivateChannel = this.webSocket$
          .multiplex(
            () => ({
              event: 'pusher:subscribe',
              data: {
                auth,
                channel,
              },
            }),
            () => ({ unsubscribe: channel }),
            (message: any) => message.channel === channel
          )
          .pipe(
            takeUntil(this.unsubscribe$),
            finalize(() => (this.channels[channel] = null))
          );
        this.channels[channel] = PrivateChannel;
        return PrivateChannel;
      })
    );
  }

  /**
   * close websocket connection and clean up all subscriptions
   */
  close(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * get private channel auth key
   * @param socket_id
   * @param channel_name
   */
  getAuthKey(socket_id: string, channel_name: string): Observable<string> {
    return this.http
      .post<any>(`${environment.apiUrl}broadcasting/auth`, {
        socket_id,
        channel_name,
      })
      .pipe(map((auth: any) => auth?.auth));
  }
}
