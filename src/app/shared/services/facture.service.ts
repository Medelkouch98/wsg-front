import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  ExportEtatResponse,
  IFacture,
  PaginatedApiResponse,
  QueryParam,
} from '@app/models';
import { FACTURE_API_URL } from '@app/config';
import { Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import * as webSocketActions from '../../core/store/websocket/websocket.actions';
import { AppState } from '../../core/store/app.state';
import { IFactureRequest } from '../../features/gestion/shared/models';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class FactureService {
  constructor(private http: HttpClient, private store: Store<AppState>) {}

  /**
   * Rechercher la liste des factures
   * @param params QueryParam
   * @return Observable<PaginatedApiResponse<IFacture>>
   */
  getInvoices(params: QueryParam): Observable<PaginatedApiResponse<IFacture>> {
    return this.http.get<PaginatedApiResponse<IFacture>>(`${FACTURE_API_URL}`, {
      params,
    });
  }

  /**
   * Export facture xsl et pdf
   * @param {QueryParam} params
   * @return  Observable<ExportEtatResponse>
   */
  invoiceExport(params: QueryParam): Observable<ExportEtatResponse> {
    return this.http
      .post<ExportEtatResponse>(`${FACTURE_API_URL}/export`, params)
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
   * Créer avoir
   * @param id number
   * @return Observable<IFacture>
   */
  public createAvoir(id: number): Observable<IFacture> {
    return this.http.post<IFacture>(`${FACTURE_API_URL}/${id}/avoirs`, {});
  }

  /**
   * Récupérer le duplicata
   * @param id number
   * @return Observable<HttpResponse<Blob>>
   */
  public getDuplicata(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${FACTURE_API_URL}/${id}/duplicata`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Récupérer le pdf de la facture
   * @param id number
   * @return Observable<HttpResponse<Blob>>
   */
  getFacturePdf(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${FACTURE_API_URL}/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Télécharger la facture
   * @param ids number[]
   * @return Observable<HttpResponse<Blob>>
   */
  public downloadFacturePdf(ids: number[]): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${FACTURE_API_URL}/download`,
      {
        factures: ids,
      },
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }

  /**
   * Envoyer facture par mail
   * @param id number
   */
  public sendEmail(id: number) {
    return this.http.post(`${FACTURE_API_URL}/${id}/mail`, {});
  }

  /**
   * Récupérer la facture
   * @param id {number}
   * @param query {string}
   * @return Observable<IFacture>
   */
  public getInvoice(id: number, query: string): Observable<IFacture> {
    return this.http.get<IFacture>(`${FACTURE_API_URL}/${id}${query}`);
  }

  /**
   * Refacturer
   * @param {number} id
   * @param {IFactureRequest} data
   * @return {Observable<HttpResponse<Blob>>}
   */
  public refacturer(
    id: number,
    data: IFactureRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(`${FACTURE_API_URL}/${id}/refacturation`, data, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
