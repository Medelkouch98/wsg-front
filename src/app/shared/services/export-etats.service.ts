import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, iif, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { exportFile } from '@app/helpers';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import {
  DownloadsInProgress,
  ExportEtatResponse,
  IExportEtatRequest,
  WebsocketExportDataResponse,
} from '@app/models';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.state';
import * as webSocketActions from '../../core/store/websocket/websocket.actions';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ExportEtatsService {
  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private store: Store<AppState>,
    private translateService: TranslateService
  ) {}

  /**
   * Export état .
   *
   * @param data - Les données d'export à envoyer.
   * @returns Une Observable contenant la réponse de l'API.
   */
  exportEtat(data: IExportEtatRequest): Observable<ExportEtatResponse> {
    return this.http
      .post<ExportEtatResponse>(`${environment.apiUrl}etats/export`, data)
      .pipe(
        tap((response: ExportEtatResponse) =>
          this.addDownloadToInProgressList({
            uuid: response.uuid,
            progress: 0,
            date: moment(),
          })
        )
      );
  }

  /**
   * download file by uiid.
   * @param {string} fileUuid.
   * @param uuid
   * @returns {Observable<HttpResponse<Blob>>}
   */
  public downloadFileByUuid(
    fileUuid: string,
    uuid: string = '0'
  ): Observable<HttpResponse<Blob>> {
    this.updateDownloadProgress(uuid, 100);
    return this.http
      .get<Blob>(`${environment.apiUrl}files/${fileUuid}`, {
        responseType: 'blob' as 'json',
        observe: 'response',
      })
      .pipe(
        tap((resp: HttpResponse<Blob>) => {
          exportFile(resp);
          setTimeout(() => {
            this.deleteDownloadFromInProgressList(uuid);
          }, 2000);
        }),
        catchError(() => {
          this.toastrService.error(
            this.translateService.instant('error.downloadFile', {
              fileUuid,
            })
          );
          setTimeout(() => {
            this.deleteDownloadFromInProgressList(uuid);
          }, 5000);
          return of(null);
        })
      );
  }

  /**
   * Télécharge les données d'un export réalisé via une connexion WebSocket.
   * @param data - Les données de l'export à télécharger.
   * @returns Une Observable contenant la réponse HTTP du serveur, ou null si l'export n'est pas encore terminé.
   */
  downloadWebsocketExportData(
    data: WebsocketExportDataResponse
  ): Observable<HttpResponse<Blob> | null> {
    return iif(
      () => data?.status === 'finished',
      this.downloadFileByUuid(data?.output?.file_uuid, data?.input?.uuid),
      of(null).pipe(
        tap(() =>
          this.updateDownloadProgress(data.input.uuid, data.progressNow)
        )
      )
    );
  }

  /**
   * Ajoute une entrée à la liste des téléchargements en cours.
   * @param file - L'entrée à ajouter à la liste.
   */
  public addDownloadToInProgressList(file: DownloadsInProgress) {
    this.store.dispatch(
      webSocketActions.AddEtatDownload({ etatDownload: file })
    );
  }

  /**
   * Supprime une entrée de la liste des téléchargements en cours.
   * @param uuid - L'identifiant UUID de l'entrée à supprimer.
   */
  deleteDownloadFromInProgressList(uuid: string) {
    this.store.dispatch(webSocketActions.DeleteEtatDownload({ uuid }));
  }

  /**
   * Met à jour la progression d'un téléchargement en cours.
   * @param uuid - L'identifiant UUID du téléchargement à mettre à jour.
   * @param progress - La nouvelle progression du téléchargement.
   */
  updateDownloadProgress(uuid: string, progress: number) {
    this.store.dispatch(
      webSocketActions.UpdateEtatDownload({ uuid, progress })
    );
  }
}
