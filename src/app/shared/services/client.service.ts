import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IClient, PaginatedApiResponse } from '@app/models';
import { environment } from '../../../environments/environment';
import {
  IClientHistorique,
  IClientProContact,
  IClientStatistics,
  ICreateProspectVehiculeRequest,
  IUpdateRelanceRequest,
} from '../../features/commercial/client/models';
import { ITarification } from '../../features/commercial/tarification/models';
import { QueryParam } from '../models';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * récupérer la liste des client
   * @param params QueryParam
   * @return Observable<PaginatedApiResponse<IClient>>
   */
  searchClients(params: QueryParam): Observable<PaginatedApiResponse<IClient>> {
    params = this.sharedService.getQuery(params);
    return this.http.get<PaginatedApiResponse<IClient>>(
      `${environment.apiUrl}clients`,
      { params }
    );
  }

  /**
   * Récupérer le client
   * @param idclient number
   * @return Observable<IClient>
   */
  getClient(idclient: number): Observable<IClient> {
    return this.http.get<IClient>(`${environment.apiUrl}clients/${idclient}`);
  }

  /**
   * Ajouter le client
   * @param client IClient
   * @return Observable<IClient>
   */
  addClient(client: IClient): Observable<IClient> {
    return this.http.post<IClient>(`${environment.apiUrl}clients`, client);
  }

  /**
   * Modifier le client
   * @param idclient number
   * @param data: {[key: string] : any}
   * @return Observable<IClient>
   */
  updateClient(
    idclient: number,
    data: { [key: string]: any }
  ): Observable<IClient> {
    return this.http.patch<IClient>(
      `${environment.apiUrl}clients/${idclient}`,
      data
    );
  }

  /**
   * Ajouter contact client pro
   * @param contact IClientContact
   * @param idclient number
   * @return Observable<IClientProContact>
   */
  addClientProContact(
    contact: IClientProContact,
    idclient: number
  ): Observable<IClientProContact> {
    return this.http.post<IClientProContact>(
      `${environment.apiUrl}clients/${idclient}/contacts`,
      contact
    );
  }

  /**
   * Modifier contact client pro
   * @param data: { [key: string]: any }
   * @param idclient number
   * @param clientProContactId number
   * @return Observable<IClientProContact>
   */
  updateClientProContact(
    data: { [key: string]: any },
    idclient: number,
    clientProContactId: number
  ): Observable<IClientProContact> {
    return this.http.patch<IClientProContact>(
      `${environment.apiUrl}clients/${idclient}/contacts/${clientProContactId}`,
      data
    );
  }

  /**
   * Supprimer client pro contact
   * @param idclient number
   * @param clientProContactId number
   */
  deleteClientProContact(
    idclient: number,
    clientProContactId: number
  ): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}clients/${idclient}/contacts/${clientProContactId}`
    );
  }

  /**
   * Ajouter prestation client pro
   * @param tarification ITarification
   * @param idclient number
   * @return Observable<ITarification>
   */
  addClientProPrestation(
    tarification: ITarification,
    idclient: number
  ): Observable<ITarification> {
    return this.http.post<ITarification>(
      `${environment.apiUrl}clients/${idclient}/prestations`,
      tarification
    );
  }

  /**
   * Modifier prestation client pro
   * @param data: { [key: string]: any }
   * @param idclient number
   * @param clientProPrestationId number
   * @return Observable<ITarification>
   */
  updateClientProPrestation(
    data: { [key: string]: any },
    idclient: number,
    clientProPrestationId: number
  ): Observable<ITarification> {
    return this.http.patch<ITarification>(
      `${environment.apiUrl}clients/${idclient}/prestations/${clientProPrestationId}`,
      data
    );
  }

  /**
   * Supprimer client pro contact
   * @param idclient number
   * @param clientProPrestationId number
   */
  deleteClientProPrestation(
    idclient: number,
    clientProPrestationId: number
  ): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}clients/${idclient}/prestations/${clientProPrestationId}`
    );
  }

  /**
   * Export a CSV of clients.
   * @param {QueryParam} params - The parameters for querying the clients.
   * @returns {Observable<HttpResponse<Blob>>} An observable that emits the exported clients as a Blob.
   */
  public exportClientCsv(params: QueryParam): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`${environment.apiUrl}clients/export`, {
      responseType: 'blob' as 'json',
      observe: 'response',
      params,
    });
  }

  /**
   * Récupérer historique client
   * @param idclient number
   * @return Observable<IClientHistorique[]>
   */
  getHistorique(idclient: number): Observable<IClientHistorique[]> {
    return this.http.get<IClientHistorique[]>(
      `${environment.apiUrl}clients/${idclient}/historique`
    );
  }

  /**
   * Modifier relance_sur
   * @param data IUpdateRelanceSurRequest
   * @param idclient number
   * @param id number
   * @return Observable<IClientHistorique>
   */
  updateRelance(
    data: IUpdateRelanceRequest,
    idclient: number,
    id: number
  ): Observable<IClientHistorique> {
    return this.http.patch<IClientHistorique>(
      `${environment.apiUrl}clients/${idclient}/historique/${id}`,
      data
    );
  }

  /**
   * Ajouter propsect vehicule
   * @param vehicule IProspectVehicule
   * @param idclient number
   * @return Observable<IClientHistorique>
   */
  addProspectVehicule(
    vehicule: ICreateProspectVehiculeRequest,
    idclient: number
  ): Observable<IClientHistorique> {
    return this.http.post<IClientHistorique>(
      `${environment.apiUrl}clients/${idclient}/historique`,
      vehicule
    );
  }

  /**
   * Récupérer les statistiques clients
   * @return Observable<IClientStatistics>
   */
  getClientsStatistics(): Observable<IClientStatistics> {
    return this.http.get<IClientStatistics>(
      `${environment.apiUrl}clients/statistics`
    );
  }

  /**
   * Supprimer propsect vehicule
   * @param prospectId number
   * @param idclient number
   * @return Observable<IClientHistorique>
   */
  deleteProspectVehicule(
    idclient: number,
    prospectId: number
  ): Observable<IClientHistorique> {
    return this.http.delete<IClientHistorique>(
      `${environment.apiUrl}clients/${idclient}/historique/${prospectId}`
    );
  }
}
