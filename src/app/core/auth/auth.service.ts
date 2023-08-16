import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import {
  IControleur,
  ICurrentUser,
  IJwtTokens,
  ILoginRequest,
  ILoginResponse,
  IRefreshTokenResponse,
  QueryParam,
  IModule,
} from '@app/models';
import { environment } from 'environments/environment';
import { IResetPasswordConfirmRequest } from './models/reset-password-confirm-request.model';
import { map } from 'rxjs';
import { ALL_DATA_PAGINATION } from '@app/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * connecter l'utilisateur
   * @param data:IUserLoginRequest
   * @return ILoginResponse
   */
  public login(data: ILoginRequest): Observable<IJwtTokens> {
    return this.http.post<IJwtTokens>(`${environment.apiUrl}login`, data);
  }

  /**
   * récupérer l'utilisateur courant avec le token
   * @return Observable<ICurrentUser>
   */
  public getMe(): Observable<ICurrentUser> {
    return this.http.get<ICurrentUser>(`${environment.apiUrl}me`);
  }

  /**
   * retrieve a list of Controleur objects
   * @param {QueryParam} params - Query parameters to be included in the API request
   * @returns {Observable<IControleur[]>} - An observable of an array of Controleur objects, sorted based on the 'actif' and 'nom' + 'prenom' properties
   */
  public getControleurs(params: QueryParam): Observable<IControleur[]> {
    return this.http
      .get<any>(`${environment.apiUrl}controleurs?${ALL_DATA_PAGINATION}`, {
        params,
      })
      .pipe(
        map(({ data: controleurs }: { data: IControleur[] }) =>
          controleurs.sort((a: IControleur, b: IControleur) =>
            a.actif === b.actif
              ? `${a.nom}${a.prenom}`.localeCompare(`${b.nom}${b.prenom}`)
              : +b.actif - +a.actif
          )
        )
      );
  }

  /**
   * récuperer un nouveau accessToken à l'aide du refreshToken
   * @param refresh_token
   * @return Observable<IRefreshTokenResponse>
   */
  refreshToken(refresh_token: string): Observable<IRefreshTokenResponse> {
    return this.http.post<IRefreshTokenResponse>(
      `${environment.apiUrl}refresh_token`,
      {
        refresh_token,
      }
    );
  }

  /**
   * récuperer le refreshToken
   * @return Observable<{refresh_token: string}>
   */
  getRefreshToken(token: string): Observable<{ refresh_token: string }> {
    return this.http.get<{ refresh_token: string }>(
      `${environment.apiUrl}refresh_token`,
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
  }

  /**
   * reset password
   * @param email
   * @return Observable<any>
   */
  forgotPassword(login: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}password_reset`,
      {
        login,
      },
      { observe: 'response' }
    );
  }

  /**
   * confirm reset password
   * @param data IResetPasswordConfirmRequestModel
   * @return Observable<any>
   */
  resetPassword(data: IResetPasswordConfirmRequest): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}password_reset/confirm`,
      data
    );
  }

  /**
   * check reset password token
   * @param token string
   * @return Observable<any>
   */
  checkResetPasswordToken(token: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}password_reset/verify`, {
      token,
    });
  }

  /**
   * fetch currentUser modules
   * @return Observable<ICurrentUser>
   */
  public getCurrentUserModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(`${environment.apiUrl}me/modules`);
  }
}
