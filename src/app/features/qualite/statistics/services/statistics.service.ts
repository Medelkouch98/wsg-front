import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { IControleur, QueryParam } from '@app/models';
import {
  IControlStatisticsResponse,
  IContreVisiteStatisticsResponse,
  IAverageDurationStatisticsResponse,
  IDefectStatisticsResponse,
} from '../models';
import { StatisticsModuleEnum } from '../enum';
import { STATISTICS_API_URL } from '@app/config';
import { Observable, map } from 'rxjs';

const ACTIVITY_STATISTICS_API_URL = STATISTICS_API_URL + 'activite';
const AVERAGE_DURATION_STATISTICS_API_URL = STATISTICS_API_URL + 'duree';
const DEFECT_STATISTICS_API_URL = STATISTICS_API_URL + 'defaillances';
const STATISTICS_CONTROLEURS_API_URL = STATISTICS_API_URL + 'controleurs';
const ACTIVITY_RECAP_API_URL = STATISTICS_CONTROLEURS_API_URL + '/activite';

@Injectable()
export class StatisticsService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieve a list of Controleur that have data
   * @param {QueryParam} params - Query parameters to be included in the API request
   * @returns {Observable<IControleur[]>} - An observable of an array of Controleur objects
   */
  public getStatisticsControleurs(
    params: QueryParam
  ): Observable<IControleur[]> {
    if (params.module === StatisticsModuleEnum.AverageDuration) {
      params.module = StatisticsModuleEnum.Activity;
    }

    return this.http.get<IControleur[]>(STATISTICS_CONTROLEURS_API_URL, {
      params,
    });
  }

  /**
   * Search for control statistics.
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<IControlStatisticsResponse[]>} An observable that emits an array of `IControlStatisticsResponse` objects.
   */
  public searchControlStatistics(
    params: QueryParam
  ): Observable<IControlStatisticsResponse[]> {
    return this.http.get<IControlStatisticsResponse[]>(
      ACTIVITY_STATISTICS_API_URL + '/controles',
      { params }
    );
  }

  /**
   * Search for control statistics recap.
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<IControlStatisticsResponse[]>} An observable that emits an array of `IControlStatisticsResponse` objects.
   */
  public searchControlStatisticsRecap(
    params: QueryParam
  ): Observable<IControlStatisticsResponse[]> {
    return this.http.get<IControlStatisticsResponse[]>(
      ACTIVITY_RECAP_API_URL + '/controles',
      { params }
    );
  }

  /**
   * Search for contre-visite statistics.
   * Transforms the response data into a format that includes extra informations (2 rows for centers 3 rows for controllers).
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<IContreVisiteStatisticsResponse[]>} An observable that emits an array of `IContreVisiteStatisticsResponse` objects.
   */
  public searchContreVisiteStatistics(
    params: QueryParam
  ): Observable<IContreVisiteStatisticsResponse[]> {
    return this.http
      .get<IContreVisiteStatisticsResponse[]>(
        ACTIVITY_STATISTICS_API_URL + '/contre-visites',
        { params }
      )
      .pipe(
        map((response: IContreVisiteStatisticsResponse[]) => {
          const sliceSize = params.agrement_vl ? 3 : 2;
          return this.addExtras(response, sliceSize);
        })
      );
  }

  /**
   * Search for average duration statistics.
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<IAverageDurationStatisticsResponse[]>} An observable that emits an array of `IAverageDurationStatisticsResponse` objects.
   */
  public searchAverageDurationStatistics(
    params: QueryParam
  ): Observable<IAverageDurationStatisticsResponse[]> {
    return this.http.get<IAverageDurationStatisticsResponse[]>(
      AVERAGE_DURATION_STATISTICS_API_URL,
      { params }
    );
  }

  /**
   * Search for defect statistics.
   * Transforms the response data into a format that includes extra informations (2 rows for controllers).
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<IDefectStatisticsResponse[]>} An observable that emits an array of `IDefectStatisticsResponse` objects.
   */
  public searchDefectStatistics(
    params: QueryParam
  ): Observable<IDefectStatisticsResponse[]> {
    return this.http
      .get<IDefectStatisticsResponse[]>(DEFECT_STATISTICS_API_URL, { params })
      .pipe(
        map((response: IDefectStatisticsResponse[]) => {
          if (!params.agrement_vl) return response;
          return this.addExtras(response, 2);
        })
      );
  }

  /**
   * Export statistics as a blob file.
   * @param {QueryParam} params - The parameters for querying the statistics.
   * @returns {Observable<HttpResponse<Blob>>} An observable that emits the exported statistics as a Blob.
   */
  public exportStatistics(params: QueryParam): Observable<HttpResponse<Blob>> {
    const moduleUrls = {
      [StatisticsModuleEnum.Activity]: ACTIVITY_STATISTICS_API_URL,
      [StatisticsModuleEnum.AverageDuration]:
        AVERAGE_DURATION_STATISTICS_API_URL,
      [StatisticsModuleEnum.Defect]: DEFECT_STATISTICS_API_URL,
    };

    const url: string = moduleUrls[<StatisticsModuleEnum>params['module']];
    return this.http.get<Blob>(`${url}/export`, {
      responseType: 'blob' as 'json',
      observe: 'response',
      params,
    });
  }

  /**
   * Adds extras to the response object for every Nth item, where N is the slice size.
   * @param {Array<any>} response - The array of response objects to add extras to.
   * @param {number} sliceSize - The size of the slice of response objects to add extras to.
   * @returns {Array<any>} An array of response objects with extras added for every Nth item.
   */
  private addExtras(response: any[], sliceSize: number): any[] {
    return [...response.keys()].reduce((acc, key) => {
      if (key % sliceSize !== 0) return acc;
      return [
        ...acc,
        {
          ...response[key],
          extras: response.slice(key + 1, key + sliceSize),
        },
      ];
    }, []);
  }
}
