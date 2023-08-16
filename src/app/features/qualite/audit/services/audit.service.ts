import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginatedApiResponse, QueryParam } from '@app/models';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IAuditAnomalie, IAudits, ITypeAudit } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer la listes des audits
   * @param params QueryParam
   * @return Observable<PaginatedApiResponse<IAudits>>
   */
  public getAudits(
    params: QueryParam
  ): Observable<PaginatedApiResponse<IAudits>> {
    return this.http.get<PaginatedApiResponse<IAudits>>(
      `${environment.apiUrl}audits`,
      { params }
    );
  }
  /**
   * Récupérer la listes de types audit
   * @return Observable<ITypeAudit[]>
   */
  public getAuditTypes(): Observable<ITypeAudit[]> {
    return this.http.get<ITypeAudit[]>(`${environment.apiUrl}audit-types`);
  }

  /**
   * Modifier anomalie
   * @param idAnomalie number
   * @param data: {[key: string] : string }
   * @return Observable<IAuditAnomalie>
   */
  public updateAuditAnomalie(
    idAnomalie: number,
    data: { [key: string]: string }
  ): Observable<IAuditAnomalie> {
    return this.http.patch<IAuditAnomalie>(
      `${environment.apiUrl}audit-anomalies/${idAnomalie}`,
      data
    );
  }

  /**
   * Ajouter fichier
   * @param formData FormData
   * @return Observable<IAuditAnomalie>
   */
  public addFile(formData: FormData): Observable<IAuditAnomalie> {
    return this.http.post<IAuditAnomalie>(
      `${environment.apiUrl}audit-anomalie-fichiers`,
      formData
    );
  }

  /**
   * Récupérer le fichier
   * @param idFile number
   * @return Observable<Blob>
   */
  public getFile(idFile: number): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}audit-anomalie-fichiers/${idFile}`,
      {
        responseType: 'blob',
      }
    );
  }

  /**
   * Supprimer le fichier
   * @param idFile number
   */
  public deleteFile(idFile: number) {
    return this.http.delete(
      `${environment.apiUrl}audit-anomalie-fichiers/${idFile}`
    );
  }
}
