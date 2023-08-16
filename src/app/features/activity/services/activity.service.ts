import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { IAdvancedSearchForm, IDailyActivityCalendarResponse } from '../models';
import { PaginatedApiResponse } from '@app/models';
import { DEFAULT_PAGE_SIZE } from '@app/config';
import { environment } from '../../../../environments/environment';
import { SharedService } from '@app/services';
import { Sort } from '@angular/material/sort';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * récupérer la liste des activités du jour pour le/les centre(s) de l'utilisateur
   *
   * @param date : string au format yyyy-MM-dd
   * returns Observable<IDailyActivityCalendarResponse[]>
   */
  public getDailyActivityCalendar(
    date: string
  ): Observable<IDailyActivityCalendarResponse[]> {
    return this.http.get<IDailyActivityCalendarResponse[]>(
      `${environment.apiUrl}controles/activite-journaliere?date=${date}`
    );
  }

  /**
   * recheche d'activité
   * @param data IAdvancedSearchForm         : données de recherche
   * @param page : number      : numero de page
   * @param page_size : number : taille de la page
   * @param sort : Sort        : tri
   * @returns Observable<PaginatedApiResponse<{ [key: string]: number | string }>>
   */
  public searchActivity(
    data: IAdvancedSearchForm,
    page = 1,
    page_size = DEFAULT_PAGE_SIZE,
    sort: Sort
  ): Observable<PaginatedApiResponse<{ [key: string]: number | string }>> {
    const params = this.sharedService.getQuery(data, page, page_size, sort);
    return this.http.get<
      PaginatedApiResponse<{ [key: string]: number | string }>
    >(`${environment.apiUrl}controles/recherche-avancee`, { params });
  }
}
