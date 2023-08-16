import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ICartonLiasse,
  ICartonLiasseResponse,
  ILiasse,
  ITypeLiasse,
} from '../models';
import { ApiResponse, PaginatedApiResponse, QueryParam } from '@app/models';
import { map } from 'rxjs/operators';
import { ImprimesActionEnum, ImprimesExportTypeEnum } from '../enum';
import { IImprimesForm } from '../components/imprimes-form/models';

@Injectable()
export class ImprimesService {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer les cartons de liasses
   * @param params QueryParam
   * @return Observable<PaginatedApiResponse<ICartonLiasse>>
   */
  public getCartonsLiasses(
    params: QueryParam
  ): Observable<PaginatedApiResponse<ICartonLiasse>> {
    return this.http
      .get<PaginatedApiResponse<ICartonLiasseResponse>>(
        `${environment.apiUrl}cartonliasses`,
        { params }
      )
      .pipe(
        map((cartonsLiasses: PaginatedApiResponse<ICartonLiasseResponse>) => {
          // lorsqu'on cherche par numero de liasse le back retourne la liasse recherche type array
          if (
            cartonsLiasses?.data?.length === 1 &&
            Array.isArray(cartonsLiasses?.data[0]?.liasses)
          ) {
            // changer le type de liasses (array) en PaginatedApiResponse
            return {
              ...cartonsLiasses,
              data: [
                {
                  ...cartonsLiasses.data[0],
                  liasses: new PaginatedApiResponse(
                    cartonsLiasses?.data[0].liasses
                  ) as PaginatedApiResponse<ILiasse>,
                },
              ],
            };
          }
          // dans le cas ou on a plusieurs cartons liasses, les liasses dans les cartons sont null
          return cartonsLiasses as unknown as PaginatedApiResponse<ICartonLiasse>;
        })
      );
  }

  /**
   * Récupérer les liasses
   * @param params QueryParam
   * @return Observable<PaginatedApiResponse<ILiasse>>
   */
  public getLiasses(
    params: QueryParam
  ): Observable<PaginatedApiResponse<ILiasse>> {
    return this.http.get<PaginatedApiResponse<ILiasse>>(
      `${environment.apiUrl}liasses`,
      { params }
    );
  }

  /**
   * Récupérer les statistiques des imprimés réglementaires
   * @return Observable<ApiResponse<{[key: string]: number}>>
   */
  public imprimesStatistics(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(
      `${environment.apiUrl}cartonliasses/total-disponible`
    );
  }

  /**
   * Récupérer type liasse
   * @param params QueryParam
   * @return Observable<ITypeLiasse[]>
   */
  public typeLiasses(params: QueryParam): Observable<ITypeLiasse[]> {
    return this.http.get<ITypeLiasse[]>(`${environment.apiUrl}typeliasses`, {
      params,
    });
  }

  /**
   * Anuuler ou prêter liasse
   * @param liasse IImprimesForm
   * @param actionType ImprimesActionEnum
   * @return Observable<ApiResponse<[]>>
   */
  public save(
    liasse: IImprimesForm,
    actionType: ImprimesActionEnum
  ): Observable<ApiResponse<[]>> {
    return this.http.post<ApiResponse<[]>>(
      `${environment.apiUrl}liasses/${actionType}`,
      liasse
    );
  }

  /**
   * Exporter
   * @param typeExport ExportTypeEnum
   * @return Observable<Blob>
   */
  public export(
    typeExport: ImprimesExportTypeEnum
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${environment.apiUrl}liasses/export`,
      { type_export: typeExport },
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }
}
