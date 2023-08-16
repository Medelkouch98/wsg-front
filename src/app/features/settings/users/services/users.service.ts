import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  IControleur,
  IUser,
  PaginatedApiResponse,
  QueryParam,
} from '@app/models';

import {
  ALL_DATA_PAGINATION,
  API_URL,
  CONTROLEURS_API_URL,
  USERS_API_URL,
} from '@app/config';
import { IDesactivationMotif, IRNC2User } from '../models';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  /**
   * Searches for users using the specified query parameters.
   * @param {QueryParam} params - The query parameters to use for the search.
   * @return {Observable<PaginatedApiResponse<IUser>>} An observable of a paginated API response containing the search results.
   */
  public searchUsers(
    params: QueryParam
  ): Observable<PaginatedApiResponse<IUser>> {
    return this.http.get<PaginatedApiResponse<IUser>>(USERS_API_URL, {
      params,
    });
  }

  /**
   * Retrieves a user with the specified ID.
   * @param {number} idUser - The ID of the user to retrieve.
   * @return {Observable<IUser>} An observable of the user with the specified ID.
   */
  public getUser(idUser: number): Observable<IUser> {
    return this.http.get<IUser>(`${USERS_API_URL}/${idUser}`);
  }

  /**
   * Adds a new user.
   * @param {IUser} user - The user to add.
   * @return {Observable<IUser>} An observable of the added user.
   */
  public addUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${USERS_API_URL}`, user);
  }

  /**
   * Updates an existing user.
   * @param {number} idUser - The user Id
   * @param {IUser} user - The updated user information.
   * @return {Observable<IUser>} An observable of the updated user.
   */
  public updateUser(idUser: number, user: Partial<IUser>): Observable<IUser> {
    return this.http.patch<IUser>(`${USERS_API_URL}/${idUser}`, user);
  }

  /**
   * Deletes a user with the specified ID.
   * @param {number} idUser - The ID of the user to delete.
   */
  public deleteUser(idUser: number): Observable<void> {
    return this.http.delete<void>(`${USERS_API_URL}/${idUser}`);
  }

  /**
   * Retrieve RNC2 user data from the server.
   *
   * @param agrementVl - The agreement value used to identify the user.
   * @returns An observable that emits the RNC2 user data when the request is successful.
   */
  public getRNC2User(agrementVl: string): Observable<IRNC2User> {
    return this.http.get<IRNC2User>(
      `${USERS_API_URL}/${agrementVl}/rnc2-infos`
    );
  }

  /**
   * Returns the desactivation motifs list.
   * @return {Observable<IDesactivationMotif>}
   */
  public getDesactivationMotifs(): Observable<IDesactivationMotif[]> {
    return this.http.get<IDesactivationMotif[]>(
      `${API_URL}desactivation-motifs`
    );
  }

  /**
   * Retrieves a list of unattached users from the API
   * @returns {Observable<IUser[]>} An observable that emits an array of IUser objects
   */
  public getUnattachedUsers(): Observable<IUser[]> {
    return this.http
      .get<PaginatedApiResponse<IUser>>(
        `${USERS_API_URL}?${ALL_DATA_PAGINATION}`,
        { params: { is_controleur: 0 } }
      )
      .pipe(map(({ data }) => data));
  }

  /**
   * Checks if a user with the given login already exists.
   * @param {string} login The login to check for existence.
   * @returns {Observable<boolean>} An observable that emits a boolean value indicating whether a user with the specified login already exists.
   */
  public isLoginExists(login: string): Observable<boolean> {
    return this.http.get<boolean>(`${USERS_API_URL}/exists`, {
      params: { login },
    });
  }

  /**
   * Checks if a controleur with the given agrement_vl already exists.
   * @param {string} agrement_vl The agrement_vl to check for existence.
   * @returns {Observable<boolean>} An observable that emits a boolean value indicating whether a controleur with the specified agrement_vl already exists.
   */
  public isAgrementExists(agrement_vl: string): Observable<boolean> {
    return this.http.get<boolean>(`${CONTROLEURS_API_URL}/exists`, {
      params: { agrement_vl },
    });
  }

  /**
   * Export a PDF of users.
   * @param {QueryParam} params - The parameters for querying the users.
   * @returns {Observable<HttpResponse<Blob>>} An observable that emits the exported users as a Blob.
   */
  public exportPdfUsers(params: QueryParam): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`${USERS_API_URL}/export`, {
      responseType: 'blob' as 'json',
      observe: 'response',
      params,
    });
  }

  /**
   * Attaches a user to a controleur.
   * @param {number} controleurId The ID of the controleur to which the user will be attached.
   * @param {number} userId The ID of the user to attach to the controleur.
   * @returns {Observable<unknown>} An observable that emits when the attachment is complete.
   */
  public attachUser(controleurId: number, userId: number): Observable<unknown> {
    return this.http.put<unknown>(
      `${CONTROLEURS_API_URL}/${controleurId}/attach/${userId}`,
      null
    );
  }

  /**
   * Export certificate as PDF.
   * @param {number} controleurId - The Id of the controller
   * @returns {Observable<HttpResponse<Blob>>} An observable that emits the certificate as a Blob.
   */
  public exportCertificate(
    controleurId: number
  ): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(
      `${CONTROLEURS_API_URL}/${controleurId}/attestation/download`,
      {
        responseType: 'blob' as 'json',
        observe: 'response',
      }
    );
  }

  /**
   * Get centre's controleurs.
   * @returns {Observable<PaginatedApiResponse<>IControleur>>}
   */
  public getControleurs(): Observable<PaginatedApiResponse<IControleur>> {
    return this.http.get<PaginatedApiResponse<IControleur>>(
      `${CONTROLEURS_API_URL}?${ALL_DATA_PAGINATION}`
    );
  }
}
