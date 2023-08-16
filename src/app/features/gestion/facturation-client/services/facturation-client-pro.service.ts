import {
  ExportEtatResponse,
  PaginatedApiResponse,
  QueryParam,
} from '@app/models';
import { Observable, tap } from 'rxjs';
import { FACTURE_API_URL, FACTURE_COMPTE_API_URL } from '@app/config';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IClientControleNonFactures, IGenerateFactureRequest } from '../models';
import * as webSocketActions from '../../../../core/store/websocket/websocket.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.state';
import { map } from 'rxjs/operators';
import { IFactureRequest } from '../../shared/models';
import * as moment from 'moment';

@Injectable()
export class FacturationClientProService {
  constructor(private http: HttpClient, private store: Store<AppState>) {}

  /**
   * Rechercher les controles non facturer
   * @param {QueryParam} params
   * @return {PaginatedApiResponse<IClientControleNonFactures>}
   */
  searchControleNonFactures(
    params: QueryParam
  ): Observable<PaginatedApiResponse<IClientControleNonFactures>> {
    return this.http.get<PaginatedApiResponse<IClientControleNonFactures>>(
      `${FACTURE_COMPTE_API_URL}controles`,
      {
        params,
      }
    );
  }

  /**
   * Récupérer la date facturation
   * @return {string}
   */
  getFacturationDate(): Observable<string> {
    return this.http
      .get<{ date: string }>(`${FACTURE_COMPTE_API_URL}date`)
      .pipe(map((el: { date: string }) => el.date));
  }

  /**
   * Facturer controles non facturer
   * @param {IGenerateFactureRequest} data
   * @return {ExportEtatResponse}
   */
  generateFacture(
    data: IGenerateFactureRequest
  ): Observable<ExportEtatResponse> {
    return this.http
      .post<ExportEtatResponse>(`${FACTURE_COMPTE_API_URL}generate`, data)
      .pipe(
        tap((response: ExportEtatResponse) =>
          this.store.dispatch(
            webSocketActions.AddEtatDownload({
              etatDownload: {
                uuid: response.uuid,
                progress: 0,
                date: moment(),
              },
            })
          )
        )
      );
  }

  /**
   * Créer facture diverse
   * @param {IFactureRequest} facture
   * @return Observable<HttpResponse<Blob>>
   */
  public storeFactureDiverse(
    facture: IFactureRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(`${FACTURE_API_URL}`, facture, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
