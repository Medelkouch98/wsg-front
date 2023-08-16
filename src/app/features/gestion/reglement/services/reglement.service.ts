import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SharedService } from '@app/services';
import { DEFAULT_PAGE_SIZE, REGLEMENTS_API_URL } from '@app/config';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs/internal/Observable';
import { IReglement, IReglementRequest, ISearchCriteria } from '../models';
import { PaginatedApiResponse } from '@app/models';

@Injectable()
export class ReglementService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * recherche de reglement
   * @param {ISearchCriteria} form
   * @param {Sort} sort
   * @param {number} page
   * @param {number} page_size
   * @return {Observable<PaginatedApiResponse<IReglement>>}
   */
  public searchReglement(
    form: ISearchCriteria,
    sort: Sort,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE
  ): Observable<PaginatedApiResponse<IReglement>> {
    const params = this.sharedService.getQuery(form, page, page_size, sort);
    return this.http.get<PaginatedApiResponse<IReglement>>(
      `${REGLEMENTS_API_URL}`,
      { params }
    );
  }

  /**
   * Récupérer le reglement
   * @param {number} idReglement
   * @return {Observable<IReglement>}
   */
  getReglement(idReglement: number): Observable<IReglement> {
    return this.http.get<IReglement>(`${REGLEMENTS_API_URL}/${idReglement}`);
  }

  /**
   * ajoute d'un reglement
   * @param {IReglementRequest} reglementRequest
   * @return {Observable<IReglement>}
   */
  addReglement(reglementRequest: IReglementRequest): Observable<IReglement> {
    return this.http.post<IReglement>(
      `${REGLEMENTS_API_URL}`,
      reglementRequest
    );
  }

  /**
   * modification d'un reglement
   * @param idReglement
   * @param data
   * @return Observable<IReglement>
   */
  updateReglement(
    idReglement: number,
    data: { [key: string]: any }
  ): Observable<IReglement> {
    return this.http.patch<IReglement>(
      `${REGLEMENTS_API_URL}/${idReglement}`,
      data
    );
  }

  /**
   * supprimer un reglement
   * @param {number} id
   * @return {Observable<void>}
   */
  deleteReglement(id: number): Observable<void> {
    return this.http.delete<void>(`${REGLEMENTS_API_URL}/${id}`);
  }

  /**
   * exporter les reglements en PDF
   * @param {ISearchCriteria} form
   * @return {Observable<HttpResponse<Blob>>}
   */
  public exportReglementsPDF(
    form: ISearchCriteria
  ): Observable<HttpResponse<Blob>> {
    const params = this.sharedService.getQuery(form);
    return this.http.get(`${REGLEMENTS_API_URL}/export-pdf`, {
      responseType: 'blob',
      observe: 'response',
      params: params,
    });
  }

  /**
   * exporter les reglements en XLS
   * @param {ISearchCriteria} form
   * @return {Observable<HttpResponse<Blob>>}
   */
  public exportReglementsXLS(
    form: ISearchCriteria
  ): Observable<HttpResponse<Blob>> {
    const params = this.sharedService.getQuery(form);
    return this.http.get(`${REGLEMENTS_API_URL}/export-xls`, {
      responseType: 'blob',
      observe: 'response',
      params: params,
    });
  }
}
