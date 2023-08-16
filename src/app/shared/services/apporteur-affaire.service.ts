import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { TypeApporteurAffaire } from '@app/config';
import {
  PaginatedApiResponse,
  IApporteurAffaireLocal,
  IApporteurAffaireNational,
  IApporteurAffaire,
  QueryParam,
} from '@app/models';
import { environment } from '../../../environments/environment';
import {
  IApporteurAffaireContact,
  IApporteurAffaireStatistics,
} from '../../features/commercial/apporteur-affaire/models';
import { ITarification } from '../../features/commercial/tarification/models';

@Injectable({
  providedIn: 'root',
})
export class ApporteurAffaireService {
  constructor(private http: HttpClient) {}

  /**
   * recheche d'apporteur d'affaire
   * @param params : QueryParam
   * @param type : string                      : type
   * @returns Observable<PaginatedApiResponse<IApporteurAffaire>>
   */
  public searchApporteurAffaire(
    params: QueryParam,
    type: TypeApporteurAffaire
  ): Observable<PaginatedApiResponse<IApporteurAffaire>> {
    return this.http.get<PaginatedApiResponse<IApporteurAffaire>>(
      `${environment.apiUrl}apporteurs/${type}`,
      { params }
    );
  }

  /**
   * Récupérer les details de l'apporteur d'affaire local
   * @param id number
   * @return Observable<IApporteurAffaireLocal>
   */
  getDetailsApporteurLocal(id: number): Observable<IApporteurAffaireLocal> {
    return this.http.get<IApporteurAffaireLocal>(
      `${environment.apiUrl}apporteurs/local/${id}`
    );
  }

  /**
   * Récupérer les details de l'apporteur d'affaire national
   * @param id number
   * @return Observable<IApporteurAffaireNational>
   */
  getDetailsApporteurNational(
    id: number
  ): Observable<IApporteurAffaireNational> {
    return this.http.get<IApporteurAffaireNational>(
      `${environment.apiUrl}apporteurs/national/${id}`
    );
  }

  /**
   * enregsitrement d'un nouveau apporteur local
   * @param apporteurAffaireDetails
   * @return Observable<IApporteurAffaireLocal>
   */
  saveApporteurAffaireLocal(
    apporteurAffaireDetails: IApporteurAffaireLocal
  ): Observable<IApporteurAffaireLocal> {
    return this.http.post<IApporteurAffaireLocal>(
      `${environment.apiUrl}apporteurs/local`,
      apporteurAffaireDetails
    );
  }

  /**
   * modification d'un apporteur local
   * @param idApporteur
   * @param data
   * @return Observable<IApporteurAffaireLocal>
   */

  updateApporteurAffaireLocal(
    idApporteur: number,
    data: { [key: string]: any }
  ): Observable<IApporteurAffaireLocal> {
    return this.http.patch<IApporteurAffaireLocal>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}`,
      data
    );
  }

  /**
   * ajout d'un contact pour un apporteur local
   * @param idApporteur:number      id de l'apporteur d'affaire
   * @param contact:IContact        le contact à enregistrer
   * @return Observable<IApporteurAffaireContact>
   */
  public addContactLocal(
    idApporteur: number,
    contact: IApporteurAffaireContact
  ): Observable<IApporteurAffaireContact> {
    return this.http.post<IApporteurAffaireContact>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/contacts`,
      contact
    );
  }

  /**
   * modification d'un contact d'un apporteur local
   * @param idApporteur:number                    id de l'apporteur d'affaire
   * @param contact:{ [key: string]: any }        le contact à modifier
   * @param idContact:number                      id du contact à modifier
   * @return Observable<IApporteurAffaireContact>
   */
  public updateContactLocal(
    idApporteur: number,
    contact: { [key: string]: any },
    idContact: number
  ): Observable<IApporteurAffaireContact> {
    return this.http.patch<IApporteurAffaireContact>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/contacts/${idContact}`,
      contact
    );
  }

  /**
   * supression d'un contact d'un apporteur local
   * @param idApporteur:number      id de l'apporteur d'affaire
   * @param id:number               id du contact
   */
  public deleteContactLocal(idApporteur: number, id: number): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/contacts/${id}`
    );
  }

  /**
   * ajout d'une tarification à un apporteur local
   * @param idApporteur:number                id de l'apporteur d'affaire
   * @param tarification:ITarification        la tarification à ajouter
   * @return Observable<ITarification>>
   */
  public addTarification(
    idApporteur: number,
    tarification: ITarification
  ): Observable<ITarification> {
    return this.http.post<ITarification>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/prestations`,
      tarification
    );
  }

  /**
   * modification d'une tarification d'un apporteur local
   * @param idApporteur:number                id de l'apporteur d'affaire
   * @param tarification:ITarification        la tarification à modifier
   * @return Observable<ITarification>>
   */
  public updateTarification(
    idApporteur: number,
    tarification: ITarification
  ): Observable<ITarification> {
    return this.http.patch<ITarification>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/prestations/${tarification.id}`,
      tarification
    );
  }

  /**
   * supression d'une tarficiation d'un apporteur local
   * @param idApporteur:number      id de l'apporteur d'affaire
   * @param id:number               id du tarfication
   */
  public deleteTarification(idApporteur: number, id: number): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}apporteurs/local/${idApporteur}/prestations/${id}`
    );
  }

  /**
   * Récupérer les statistiques apporteurs affaires
   * @return Observable<IApporteurAffaireStatistics>
   */
  getApporteursStatistics(): Observable<IApporteurAffaireStatistics> {
    return this.http.get<IApporteurAffaireStatistics>(
      `${environment.apiUrl}apporteurs/statistics`
    );
  }
}
