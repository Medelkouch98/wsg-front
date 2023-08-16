import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SharedService } from '@app/services';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs/internal/Observable';
import {
  IReleveFacture,
  IReleveFactureExportRequest,
  ISearchCriteria,
} from '../models';
import { PaginatedApiResponse } from '@app/models';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class ReleveFactureService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * recherche de releve de facture
   * @param form : any : données de recherche
   * @param sort : Sort                        : tri
   * @param page : number                      : numero de page
   * @param page_size : number                 : taille de la page
   * @returns Observable<PaginatedApiResponse<IReleveFacture>>
   */
  public searchReleveFacture(
    form: ISearchCriteria,
    sort: Sort,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE
  ): Observable<PaginatedApiResponse<IReleveFacture>> {
    const params = this.sharedService.getQuery(form, page, page_size, sort);
    return this.http.get<PaginatedApiResponse<IReleveFacture>>(
      `${environment.apiUrl}factures/clients`,
      { params }
    );
  }

  /**
   * exporter les relevés de factures
   * @param {IReleveFactureExportRequest} data
   * @param {ISearchCriteria} form
   * @return {Observable<HttpResponse<Blob>>}
   */
  public exportReleveFactures(
    data: IReleveFactureExportRequest,
    form: ISearchCriteria
  ): Observable<HttpResponse<Blob>> {
    const params = this.sharedService.getQuery(form);
    return this.http.post(
      `${environment.apiUrl}factures/clients/export`,
      data,
      {
        responseType: 'blob',
        observe: 'response',
        params: params,
      }
    );
  }
}
