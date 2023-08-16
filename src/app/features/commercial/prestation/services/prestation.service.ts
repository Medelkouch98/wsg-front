import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs/internal/Observable';
import { IPrestation, PaginatedApiResponse } from '@app/models';
import { environment } from '../../../../../environments/environment';
import { SharedService } from '@app/services';
import { ITarification } from '../../tarification/models';
import {
  IAgendaPrestationElement,
  IAgendaPrestationCategories,
  IPrestationIdentificationForm,
  IPrestationsSearchRequestForm,
  IPrestationsStatistics,
} from '../models';

@Injectable()
export class PrestationService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * recherche de prestations
   * @param data : IPrestationsSearchRequestForm : données de recherche
   * @param page : number                      : numero de page
   * @param page_size : number                 : taille de la page
   * @param sort : Sort                        : tri
   * @returns Observable<PaginatedApiResponse<IPrestation>>
   */
  public searchPrestations(
    data: IPrestationsSearchRequestForm,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE,
    sort: Sort
  ): Observable<PaginatedApiResponse<IPrestation>> {
    let params = this.sharedService.getQuery(data, page, page_size, sort);
    return this.http.get<PaginatedApiResponse<IPrestation>>(
      `${environment.apiUrl}prestations`,
      { params }
    );
  }

  /**
   * Récupérer les details de la prestation
   * @param id number
   * @return Observable<IPrestationIdentificationForm>
   */
  getPrestation(id: number): Observable<IPrestationIdentificationForm> {
    return this.http.get<IPrestationIdentificationForm>(
      `${environment.apiUrl}prestations/${id}`
    );
  }

  /**
   * modification d'une prestation
   * @param prestationId
   * @param data
   * @return Observable<IPrestation>
   */
  updatePrestation(
    prestationId: number,
    data: { [key: string]: any }
  ): Observable<IPrestationIdentificationForm> {
    return this.http.patch<IPrestationIdentificationForm>(
      `${environment.apiUrl}prestations/${prestationId}`,
      data
    );
  }

  /**
   * enregistrement d'une nouvelle prestation
   * @param prestation
   * @return Observable<IPrestationIdentificationForm>
   */
  addPrestation(
    prestation: IPrestationIdentificationForm
  ): Observable<IPrestationIdentificationForm> {
    return this.http.post<IPrestationIdentificationForm>(
      `${environment.apiUrl}prestations`,
      prestation
    );
  }

  /**
   * recuperation de la list de tarification client
   * @param prestationId : number              : id prestation
   * @param page : number                      : numero de page
   * @param page_size : number                 : taille de la page
   * @param sort : Sort                        : tri
   * @returns Observable<PaginatedApiResponse<ITarification>>
   */
  public getTarificationClient(
    prestationId: number,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE,
    sort: Sort
  ): Observable<PaginatedApiResponse<ITarification>> {
    let params = this.sharedService.getPageAndSortURL(page, page_size, sort);
    return this.http.get<PaginatedApiResponse<ITarification>>(
      `${environment.apiUrl}prestations/${prestationId}/clientpros`,
      { params }
    );
  }

  /**
   * Récupérer les agendas elements
   * @return Observable<IAgendaPrestationElement[]>
   */
  getAgendaPrestationElements(): Observable<IAgendaPrestationElement[]> {
    return this.http.get<IAgendaPrestationElement[]>(
      `${environment.apiUrl}agenda/agendas`
    );
  }

  /**
   * Récupérer les categories agenda
   * @return Observable<IAgendaPrestationCategories[]>
   */
  getAgendaPrestationCategories(): Observable<IAgendaPrestationCategories[]> {
    return this.http.get<IAgendaPrestationCategories[]>(
      `${environment.apiUrl}agenda/categories`
    );
  }

  /**
   * recuperation de la list de tarification apporteur d'affaires
   * @param prestationId : number              : id prestation
   * @param page : number                      : numero de page
   * @param page_size : number                 : taille de la page
   * @param sort : Sort                        : tri
   * @returns Observable<PaginatedApiResponse<ITarification>>
   */
  public getTarificationApporteurAffaires(
    prestationId: number,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE,
    sort: Sort
  ): Observable<PaginatedApiResponse<ITarification>> {
    let params = this.sharedService.getPageAndSortURL(page, page_size, sort);
    return this.http.get<PaginatedApiResponse<ITarification>>(
      `${environment.apiUrl}prestations/${prestationId}/apporteurlocals`,
      { params }
    );
  }

  /**
   * Récupérer les statistiques prestations
   * @return Observable<IPrestationsStatistics>
   */
  getPrestationsStatistics(): Observable<IPrestationsStatistics> {
    return this.http.get<IPrestationsStatistics>(
      `${environment.apiUrl}prestations/statistics`
    );
  }
}
