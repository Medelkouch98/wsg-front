import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ALL_DATA_PAGINATION, ROLES_MODULES_API_URL } from '@app/config';
import { Observable, map } from 'rxjs';
import { IRole, PaginatedApiResponse } from '@app/models';
import { IRoleFormGroupValue } from '../models';

@Injectable()
export class RolesService {
  constructor(private http: HttpClient) {}

  /**
   * Searches for roles using the specified query parameters.
   * @param {QueryParam} params - The query parameters to use for the search.
   * @return {Observable<PaginatedApiResponse<IUser>>} An observable of a paginated API response containing the search results.
   */
  public searchRoles(): Observable<IRole[]> {
    return this.http
      .get<PaginatedApiResponse<IRole>>(
        `${ROLES_MODULES_API_URL}?${ALL_DATA_PAGINATION}`
      )
      .pipe(map(({ data }) => data));
  }

  /**
   * Retrieves a role with the specified ID.
   * @param {number} idRole - The ID of the role to retrieve.
   * @return {Observable<IRole>} An observable of the role with the specified ID.
   */
  public getRole(idRole: number): Observable<IRole> {
    return this.http.get<IRole>(`${ROLES_MODULES_API_URL}/${idRole}`).pipe(
      map((role) => ({
        ...role,
        modules: role.modules.sort((a, b) => a.ordre - b.ordre),
      }))
    );
  }

  /**
   * Adds a new role.
   * @param {IRole} role - The role to add.
   * @return {Observable<IRole>} An observable of the added role.
   */
  public addRole(role: IRole): Observable<IRole> {
    return this.http.post<IRole>(`${ROLES_MODULES_API_URL}`, role);
  }

  /**
   * Checks if a role with the given name already exists.
   * @param {string} name The role name to check for existence.
   * @returns {Observable<boolean>} An observable that emits a boolean value indicating whether a role with the specified name already exists.
   */
  public isRoleNameExists(role_name: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${ROLES_MODULES_API_URL}/verify`, {
        params: { role_name },
      })
      .pipe(map((available) => !available));
  }

  /**
   * Updates the permissions of a role on the server.
   * @param {IRoleFormGroupValue} role - The updated role object.
   * @returns {Observable<void>} - An Observable that completes when the update is successful.
   */
  public updateRole(role: IRoleFormGroupValue): Observable<void> {
    return this.http.patch<void>(`${ROLES_MODULES_API_URL}/permissions`, role);
  }
}
