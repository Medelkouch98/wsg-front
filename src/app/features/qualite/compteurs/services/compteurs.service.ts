import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import {
  ICompteurAddActionData,
  ICompteursSearchResponse,
  IDocumentUploadData,
  IEditJustificationData,
  IJustificationsResponse,
  IJustifieForAllData,
  ISearchCriteria,
} from '../models';
import { SharedService } from '@app/services';
import { environment } from '../../../../../environments/environment';
import { GlobalHelper } from '@app/helpers';

@Injectable()
export class CompteursService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /**
   * recherche de compteurs
   * @param {ISearchCriteria} searchCriteria
   * @return {Observable<ICompteursSearchResponse>}
   */
  public searchCompteurs(
    searchCriteria: ISearchCriteria
  ): Observable<ICompteursSearchResponse> {
    const params = this.sharedService.getQuery(searchCriteria);
    return this.http.get<ICompteursSearchResponse>(
      `${environment.apiUrl}compteurs`,
      { params }
    );
  }

  /**
   * récupérer les justifications de compteur
   * @param {string} codeCompteur
   * @returns {Observable<IJustificationsResponse[]>}
   */
  public getJustifications(
    codeCompteur: string
  ): Observable<IJustificationsResponse[]> {
    return this.http.get<IJustificationsResponse[]>(
      `${environment.apiUrl}compteurs/justifications/${codeCompteur}`
    );
  }

  /**
   * ajout de justification pour tous les controles
   * @param {IJustifieForAllData} data
   * @param {number} year
   * @param {number} month
   * @returns {Observable<void>}
   */
  public justifieAll(
    data: IJustifieForAllData,
    year: number,
    month: number
  ): Observable<void> {
    const formData: FormData = GlobalHelper.objectToFormData(
      GlobalHelper.removeEmptyFields(data.addRequest)
    );
    return this.http.post<void>(
      `${environment.apiUrl}compteurs/justifie-all/${year}/${month}/${data.codeCompteur}`,
      formData
    );
  }

  /**
   * modification d'une justification
   * @param {IEditJustificationData} data
   * @returns {Observable<void>}
   */
  updateJustification(data: IEditJustificationData): Observable<void> {
    if (data.editJustificationRequest.justification_id === -1) {
      data.editJustificationRequest.justification_id = null;
    }
    return this.http.patch<void>(
      `${environment.apiUrl}compteurs/justifie-update/${data.compteurId}`,
      data.editJustificationRequest
    );
  }

  /**
   * ajouter une action à un compteur
   * @param {ICompteurAddActionData} data
   * @returns {Observable<void>}
   */
  addActionToCompteur(data: ICompteurAddActionData): Observable<void> {
    const postData = GlobalHelper.removeEmptyFields({
      actions: [data.addActionRequest],
    });
    return this.http.post<void>(
      `${environment.apiUrl}compteurs/actions/${data.compteurId}`,
      postData
    );
  }

  /**
   * téléchargement d'un document
   * @param {number} fichierId
   * @returns {Observable<void>}
   */
  public downloadAttachment(fichierId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${environment.apiUrl}compteurs/fichiers/download/${fichierId}`,
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }

  /**
   * upload d'un document pour un compteur
   * @param {IDocumentUploadData} compteurDocumentUploadData
   * @returns {Observable<void>}
   */
  public uploadAttachment(
    compteurDocumentUploadData: IDocumentUploadData
  ): Observable<void> {
    const formData: FormData = GlobalHelper.objectToFormData(
      compteurDocumentUploadData
    );
    return this.http.post<void>(
      `${environment.apiUrl}compteurs/fichiers/upload/${compteurDocumentUploadData.compteurId}`,
      formData
    );
  }

  /**
   * suppression d'un document
   * @param {number} fichierId
   * @returns {Observable<void>}
   */
  public deleteAttachment(fichierId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}compteurs/fichiers/${fichierId}`
    );
  }

  /**
   * Export des compteurs en PDF
   * @param {ISearchCriteria} searchCriteria
   * @returns {Observable<Blob>}
   */
  public exportPDFCompteurs(
    searchCriteria: ISearchCriteria
  ): Observable<HttpResponse<Blob>> {
    const params = this.sharedService.getSearchQuery(searchCriteria);
    return this.http.get(`${environment.apiUrl}compteurs/export`, {
      responseType: 'blob',
      observe: 'response',
      params,
    });
  }

  /**
   * Export du fichier OTC des compteurs
   * @param {ISearchCriteria} searchCriteria
   * @returns {Observable<Blob>}
   */
  public exportFichierOTC(
    searchCriteria: ISearchCriteria
  ): Observable<HttpResponse<Blob>> {
    const params = this.sharedService.getSearchQuery(searchCriteria);
    return this.http.get(`${environment.apiUrl}compteurs/fichier-otc`, {
      responseType: 'blob',
      observe: 'response',
      params,
    });
  }

  /**
   * check de compteurs : justification de tous les compteurs niveau 1 du mois en cours
   * @param {ISearchCriteria} searchCriteria
   * @return {Observable<void>}
   */
  public checkCompteurs(searchCriteria: ISearchCriteria): Observable<void> {
    //TODO: fix url once the backend is ready
    const params = this.sharedService.getQuery(searchCriteria);
    return this.http.get<void>(`${environment.apiUrl}compteurs/check`, {
      params,
    });
  }
}
