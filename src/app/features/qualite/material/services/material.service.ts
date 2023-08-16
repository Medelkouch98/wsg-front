import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { PaginatedApiResponse, QueryParam } from '@app/models';
import { ALL_DATA_PAGINATION, API_URL, MATERIAL_API_URL } from '@app/config';
import { map } from 'rxjs';
import {
  IMaterial,
  IMaterialMarque,
  IMaterialModele,
  IMaterialMaintenanceCompany,
  IMaterialSubType,
  IMaterialType,
  IMaterialEvent,
  IMaterialAlertResponse,
  IMaterialEventSelection,
  IMaterialEventType,
} from '../models';
import { GlobalHelper } from '@app/helpers';

@Injectable()
export class MaterialService {
  private http = inject(HttpClient);

  /**
   * Retrieves the list of materials.
   * @returns An Observable array of materials.
   */
  public getMaterials(): Observable<IMaterial[]> {
    return this.http.get<IMaterial[]>(MATERIAL_API_URL);
  }

  /**
   * Retrieves a specific material by ID.
   * @param idMaterial The ID of the material.
   * @returns An Observable representing the material.
   */
  public getMaterial(idMaterial: number): Observable<IMaterial> {
    return this.http.get<IMaterial>(`${MATERIAL_API_URL}/${idMaterial}`);
  }

  /**
   * Retrieves the list of material types.
   * @returns An Observable array of material types.
   */
  public getTypes(): Observable<IMaterialType[]> {
    return this.http.get<IMaterialType[]>(`${API_URL}materiel-types`);
  }

  /**
   * Retrieves the list of material sub-types.
   * @returns An Observable array of material sub-types.
   */
  public getSubTypes(): Observable<IMaterialSubType[]> {
    return this.http.get<IMaterialSubType[]>(`${API_URL}materiel-sous-types`);
  }

  /**
   * Retrieves the list of material brands.
   * @returns An Observable array of material brands.
   */
  public getMarques(): Observable<IMaterialMarque[]> {
    return this.http
      .get<PaginatedApiResponse<IMaterialMarque>>(
        `${API_URL}materiel-marques?${ALL_DATA_PAGINATION}`
      )
      .pipe(map(({ data }) => data));
  }

  /**
   * Retrieves the list of material models.
   * @returns An Observable array of material models.
   */
  public getModeles(): Observable<IMaterialModele[]> {
    return this.http
      .get<PaginatedApiResponse<IMaterialModele>>(
        `${API_URL}materiel-modeles?${ALL_DATA_PAGINATION}`
      )
      .pipe(map(({ data }) => data));
  }

  /**
   * Retrieves the list of maintenance companies.
   * @returns An Observable array of maintenance companies.
   */
  public getMaintenanceCompanies(): Observable<IMaterialMaintenanceCompany[]> {
    return this.http.get<IMaterialMaintenanceCompany[]>(
      `${API_URL}materiel-societe-maintenances`
    );
  }

  /**
   * Retrieves the list of material event types.
   * @returns An Observable array of material event types.
   */
  public getMaterialEventTypes(): Observable<IMaterialEventType[]> {
    return this.http.get<IMaterialEventType[]>(
      `${API_URL}materiel-evenement-types`
    );
  }

  /**
   * Adds a maintenance company.
   * @param company The maintenance company to add.
   * @returns An Observable representing the added maintenance company.
   */
  public addMaintenanceCompany(
    company: IMaterialMaintenanceCompany
  ): Observable<IMaterialMaintenanceCompany> {
    return this.http.post<IMaterialMaintenanceCompany>(
      `${API_URL}materiel-societe-maintenances`,
      company
    );
  }

  /**
   * Updates a maintenance company.
   * @param company The partial maintenance company data to update.
   * @returns An Observable representing the updated maintenance company.
   */
  public updateMaintenanceCompany(
    company: Partial<IMaterialMaintenanceCompany>
  ): Observable<IMaterialMaintenanceCompany> {
    return this.http.patch<IMaterialMaintenanceCompany>(
      `${API_URL}materiel-societe-maintenances/${company.id}`,
      company
    );
  }

  /**
   * Adds a material.
   * @param material The material to add.
   * @returns An Observable representing the added material.
   */
  public addMaterial(material: IMaterial): Observable<void> {
    return this.http.post<void>(`${MATERIAL_API_URL}`, material);
  }

  /**
   * Updates a material.
   * @param idMaterial The ID of the material to update.
   * @param material The partial material data to update.
   * @returns An Observable representing the updated material.
   */
  public updateMaterial(
    idMaterial: number,
    material: Partial<IMaterial>
  ): Observable<IMaterial> {
    return this.http.patch<IMaterial>(
      `${MATERIAL_API_URL}/${idMaterial}`,
      material
    );
  }

  /**
   * Deletes a material.
   * @param idMaterial The ID of the material to delete.
   * @returns An Observable representing the deletion operation.
   */
  public deleteMaterial(idMaterial: number): Observable<void> {
    return this.http.delete<void>(`${MATERIAL_API_URL}/${idMaterial}`);
  }

  /**
   * Exports a material to PDF.
   * @param idMaterial The ID of the material to export.
   * @returns An Observable representing the PDF file as a Blob.
   */
  public exportPdfMaterial(idMaterial: number): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`${MATERIAL_API_URL}/${idMaterial}/export`, {
      responseType: 'blob' as 'json',
      observe: 'response',
    });
  }

  /**
   * Retrieves the alerts for a material.
   * @param idMaterial The ID of the material.
   * @returns An Observable representing the material alerts.
   */
  public getMaterialAlerts(
    idMaterial: number
  ): Observable<IMaterialAlertResponse> {
    return this.http.get<IMaterialAlertResponse>(
      `${MATERIAL_API_URL}/${idMaterial}/alertes`
    );
  }

  /**
   * Exports materials to a CSV file.
   * @param params The query parameters for the export.
   * @returns An Observable representing the CSV file as a Blob.
   */
  public exportMaterials(params: QueryParam): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`${MATERIAL_API_URL}/export`, {
      responseType: 'blob' as 'json',
      observe: 'response',
      params,
    });
  }

  /**
   * Adds a material event selection.
   * @param eventSelection The material event selection to add.
   * @returns An Observable representing the addition operation.
   */
  public addEventSeletion(
    eventSelection: IMaterialEventSelection
  ): Observable<void> {
    const formData: FormData = GlobalHelper.objectToFormData(eventSelection);
    return this.http.post<void>(`${API_URL}materiel-evenements`, formData);
  }

  /**
   * Adds an event to a material.
   * @param idMaterial The ID of the material.
   * @param event The event to add.
   * @returns An Observable representing the addition operation.
   */
  public addEvent(idMaterial: number, event: IMaterialEvent): Observable<void> {
    const formData: FormData = GlobalHelper.objectToFormData(event);
    return this.http.post<void>(
      `${MATERIAL_API_URL}/${idMaterial}/evenements`,
      formData
    );
  }

  /**
   * Updates an event of a material.
   * @param idMaterial The ID of the material.
   * @param event The partial event data to update.
   * @returns An Observable representing the update operation.
   */
  public updateEvent(
    idMaterial: number,
    event: Partial<IMaterialEvent>
  ): Observable<void> {
    const formData: FormData = GlobalHelper.objectToFormData(event);
    return this.http.post<void>(
      `${MATERIAL_API_URL}/${idMaterial}/evenements/${event.id}`,
      formData
    );
  }

  /**
   * Deletes an event from a material.
   * @param idMaterial The ID of the material.
   * @param idEvent The ID of the event to delete.
   * @returns An Observable representing the deletion operation.
   */
  public deleteEvent(idMaterial: number, idEvent: number): Observable<void> {
    return this.http.delete<void>(
      `${MATERIAL_API_URL}/${idMaterial}/evenements/${idEvent}`
    );
  }

  /**
   * Downloads an event file.
   * @param fileUrl The URL of the file to download.
   * @returns An Observable representing the file as a Blob.
   */
  public downloadEventFile(fileUrl: string): Observable<HttpResponse<Blob>> {
    return this.http.get(fileUrl, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Deletes an event file.
   * @param eventId The ID of the event.
   * @param fileId The ID of the file to delete.
   * @returns An Observable representing the deletion operation.
   */
  public deleteEventFile(eventId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(
      `${API_URL}materiel-evenements/${eventId}/fichiers/${fileId}`
    );
  }
}
