import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ICategorie,
  ICivilite,
  IEcheance,
  IEnergie,
  IFamilleIT,
  IMarque,
  IModele,
  IModeReglement,
  IPrestation,
  IRole,
  ITva,
  ITypeControle,
  PaginatedApiResponse,
} from '@app/models';
import { environment } from 'environments/environment';
import { ALL_DATA_PAGINATION, ROLES_API_URL } from '@app/config';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste des réglements
   * @returns Observable<PaginatedApiResponse<IModeReglementResponse>>
   */
  public getModesReglements(): Observable<
    PaginatedApiResponse<IModeReglement>
  > {
    return this.http.get<PaginatedApiResponse<IModeReglement>>(
      `${environment.apiUrl}modereglements?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des types controle
   * @returns Observable<PaginatedApiResponse<ITypeControle>>
   */
  public getTypesControle(): Observable<PaginatedApiResponse<ITypeControle>> {
    return this.http.get<PaginatedApiResponse<ITypeControle>>(
      `${environment.apiUrl}typecontroles?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des catégories
   * @returns Observable<PaginatedApiResponse<ICategorie>>
   */
  public getCategories(): Observable<PaginatedApiResponse<ICategorie>> {
    return this.http.get<PaginatedApiResponse<ICategorie>>(
      `${environment.apiUrl}categories?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des énergies
   * @returns Observable<PaginatedApiResponse<IEnergie>>
   */
  public getEnergies(): Observable<PaginatedApiResponse<IEnergie>> {
    return this.http.get<PaginatedApiResponse<IEnergie>>(
      `${environment.apiUrl}energies?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des civilites
   * @returns Observable<PaginatedApiResponse<ICivilite>>
   */
  public getCivilites(): Observable<PaginatedApiResponse<ICivilite>> {
    return this.http.get<PaginatedApiResponse<ICivilite>>(
      `${environment.apiUrl}civilites?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des prestations
   * @returns Observable<PaginatedApiResponse<IPrestation>>
   */
  public getPrestations(): Observable<PaginatedApiResponse<IPrestation>> {
    return this.http.get<PaginatedApiResponse<IPrestation>>(
      `${environment.apiUrl}prestations?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des echeances
   * @return Observable<PaginatedApiResponse<IEcheance>>
   */
  public getEcheances(): Observable<PaginatedApiResponse<IEcheance>> {
    return this.http.get<PaginatedApiResponse<IEcheance>>(
      `${environment.apiUrl}echeances?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des marques
   * @return Observable<PaginatedApiResponse<IMarque>>
   */
  getMarques(): Observable<PaginatedApiResponse<IMarque>> {
    return this.http.get<PaginatedApiResponse<IMarque>>(
      `${environment.apiUrl}marques?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * récupérer la liste des modeles par marque
   * @param marque string
   * @return IModele[]
   */
  searchModeleByMarque(marque: string): Observable<IModele[]> {
    return this.http.get<IModele[]>(
      `${environment.apiUrl}marques/${marque}/modeles`
    );
  }

  /**
   * Récupérer la liste des TVAs
   * @returns Observable<PaginatedApiResponse<ITva>>
   */
  public getTVAs(): Observable<PaginatedApiResponse<ITva>> {
    return this.http.get<PaginatedApiResponse<ITva>>(
      `${environment.apiUrl}tvas?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des familles
   * @returns Observable<PaginatedApiResponse<IFamilleIT>>
   */
  public getFamillesIT(): Observable<PaginatedApiResponse<IFamilleIT>> {
    return this.http.get<PaginatedApiResponse<IFamilleIT>>(
      `${environment.apiUrl}familles?${ALL_DATA_PAGINATION}`
    );
  }

  /**
   * Récupérer la liste des roles
   * @returns Observable<PaginatedApiResponse<IRole>>
   */
  public getRoles(): Observable<PaginatedApiResponse<IRole>> {
    return this.http.get<PaginatedApiResponse<IRole>>(
      `${ROLES_API_URL}?${ALL_DATA_PAGINATION}`
    );
  }
}
