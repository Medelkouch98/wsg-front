import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '@app/services';
import { Sort } from '@angular/material/sort';
import { CLOTURE_CAISSE_API_URL, DEFAULT_PAGE_SIZE } from '@app/config';
import { Observable } from 'rxjs/internal/Observable';
import { PaginatedApiResponse, QueryParam } from '@app/models';
import {
  IClotureCaisseInitialData,
  IClotureCaisseRequest,
  IClotureCaisseSearchResponse,
  IClotureRequestResponse,
  IFeuilleDeCaisse,
  ISearchCriteria,
} from '../models';

@Injectable()
export class ClotureCaisseService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * recherche de cloture de caisse
   * @param {ISearchCriteria} form
   * @param {Sort} sort
   * @param {number} page
   * @param {number} page_size
   * @return {Observable<PaginatedApiResponse<IClotureCaisseSearchResponse>>}
   */
  public searchClotureCaisse(
    form: ISearchCriteria,
    sort: Sort,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE
  ): Observable<PaginatedApiResponse<IClotureCaisseSearchResponse>> {
    const params = this.sharedService.getQuery(form, page, page_size, sort);
    return this.http.get<PaginatedApiResponse<IClotureCaisseSearchResponse>>(
      `${CLOTURE_CAISSE_API_URL}`,
      { params }
    );
  }

  /**
   * récupérer la dernière cloture de caisse
   * @return {Observable<IClotureCaisseSearchResponse>}
   */
  public getLastCloture(): Observable<IClotureCaisseSearchResponse> {
    return this.http.get<IClotureCaisseSearchResponse>(
      `${CLOTURE_CAISSE_API_URL}/last-cloture`
    );
  }

  /**
   * verifier s'il y a une cloture pour les dates en paramètre
   * @param {QueryParam} params
   * @return {Observable<Boolean>}
   */
  public verifyClotureCaisse(params: QueryParam): Observable<Boolean> {
    return this.http.get<Boolean>(`${CLOTURE_CAISSE_API_URL}/verify`, {
      params,
    });
  }
  /**
   * supprimer une cloture de caisse
   * @param {number} id
   * @return {Observable<void>}
   */
  deleteCloture(id: number): Observable<void> {
    return this.http.delete<void>(`${CLOTURE_CAISSE_API_URL}/${id}`);
  }

  /**
   * clôturer la caisse
   * @param {IClotureCaisseRequest} form
   * @return {Observable<IClotureRequestResponse>}
   */
  public cloturerCaisse(
    form: IClotureCaisseRequest
  ): Observable<IClotureRequestResponse> {
    return this.http.post<IClotureRequestResponse>(
      `${CLOTURE_CAISSE_API_URL}`,
      form
    );
  }

  /**
   * Récupérer la feuille de caisse
   * @param id number
   * @return Observable<IFeuilleDeCaisse>
   */
  getFeuilleDeCaisse(id: number): Observable<IFeuilleDeCaisse> {
    return this.http.get<IFeuilleDeCaisse>(`${CLOTURE_CAISSE_API_URL}/${id}`);
  }

  /**
   * Récupérer les données nécessaires pour la preparation de la création de cloture
   * @param {string} date_debut
   * @param {string} date_fin
   * @return {Observable<IClotureCaisseInitialData>}
   */
  getClotureDeCaisseInitialData(
    date_debut: string,
    date_fin: string
  ): Observable<IClotureCaisseInitialData> {
    return this.http.get<IClotureCaisseInitialData>(
      `${CLOTURE_CAISSE_API_URL}/create?date_debut=${date_debut}&date_fin=${date_fin}`
    );
  }
}
