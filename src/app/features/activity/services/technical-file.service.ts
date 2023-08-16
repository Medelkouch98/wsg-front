import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IControlFicheResponse } from '../models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TechnicalFileService {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer le contrôle
   * @param controlId number
   * @return Observable<IControlFicheResponse>
   */
  getControl(controlId: number): Observable<IControlFicheResponse> {
    return this.http.get<IControlFicheResponse>(
      `${environment.apiUrl}controles/${controlId}`
    );
  }

  /**
   * Récupérer le pdf du pv, facture
   * @param query string
   * @return Observable<Blob>
   */
  getPdf(query: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}controles/${query}`, {
      responseType: 'blob',
    });
  }

  /**
   * Récupérer l'attestation de passage
   * @param controlId number
   * @return Observable<Blob>
   */
  getAttestationPassage(controlId: number): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}controles/attestation-pdf/${controlId}`,
      {
        responseType: 'blob',
      }
    );
  }
}
