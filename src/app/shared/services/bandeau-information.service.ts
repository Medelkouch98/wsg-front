import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBandeauInformation } from '@app/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BandeauInformationService {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste de bandeau d'informations
   * @return Observable<ApiResponse<IBandeauInformation[]>>
   */
  public getBandeauInformation(): Observable<IBandeauInformation[]> {
    return this.http.get<IBandeauInformation[]>(`${environment.apiUrl}alerts`);
  }
}
