import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { IJwtTokens } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import * as authActions from '../store/auth/auth.actions';
import * as authSelectors from '../store/auth/auth.selectors';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>(null);
  private takeUntilSubject: Subject<boolean> = new Subject<boolean>();
  private accessToken: string = null;
  private refreshToken: string = null;
  private publicUrls = [
    '/login',
    '/refresh_token',
    '/password_reset',
    '/password_reset/verify',
  ];

  constructor(
    private authService: AuthService,
    private store: Store<AppState>
  ) {
    this.store
      .pipe(select(authSelectors.JwtTokensSelector))
      .pipe(
        filter(
          (jwtTokens: IJwtTokens) =>
            !this.accessToken || this.accessToken !== jwtTokens.token
        ),
        tap((jwtTokens: IJwtTokens) => {
          this.accessToken = jwtTokens.token;
          this.refreshToken = jwtTokens.refresh_token;
          this.refreshTokenSubject.next(this.accessToken);
        })
      )
      .subscribe();
    this.store
      .pipe(select(authSelectors.RefreshTokenInProgressSelector))
      .subscribe((refreshTokenInProgress: boolean) => {
        this.refreshTokenInProgress = refreshTokenInProgress;
      });
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<Object>> {
    let authReq = req;
    if (!!this.accessToken && !this.isPublicUrl(authReq)) {
      authReq = this.addTokenHeader(req, this.accessToken);
    }
    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          !this.isPublicUrl(authReq) &&
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          return this.handle401Error(authReq, next);
        }
        if (authReq.url.includes('refresh_token')) {
          this.takeUntilSubject.next(true);
        }
        return throwError(error);
      })
    );
  }

  /**
   * mise à jour du accessToken à l'aide du refreshToken lors de la réception d'une HttpResponse avec le code d'erreur 401
   * @param request
   * @param next
   * @return Observable<string>
   * @private
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenSubject.next(null);
      this.store.dispatch(authActions.RefreshToken());
    }
    return this.refreshTokenSubject.pipe(
      filter((accessToken: string) => !!accessToken),
      take(1),
      takeUntil(this.takeUntilSubject),
      switchMap((accessToken: string) =>
        next.handle(this.addTokenHeader(request, accessToken))
      )
    );
  }

  /**
   * Ajout du token dans le header de la request
   * @param request
   * @param token
   * @return HttpRequest<any>
   * @private
   */
  private addTokenHeader(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `: Bearer ${token}`),
    });
  }

  /**
   * vérifie si la requete est public
   * @param request
   * @return boolean
   * @private
   */
  private isPublicUrl(request: HttpRequest<any>): boolean {
    return (
      this.publicUrls.filter((url: string) => request.url.includes(url))
        .length > 0
    );
  }
}
