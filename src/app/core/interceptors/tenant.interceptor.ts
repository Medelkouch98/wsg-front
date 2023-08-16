import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import * as authSelectors from '../store/auth/auth.selectors';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { ICentre } from '@app/models';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private store: Store<AppState>) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.store.pipe(
      select(authSelectors.UserCurrentCentreSelector),
      take(1),
      withLatestFrom(
        this.store.pipe(select(authSelectors.IsAuthenticatedSelector))
      ),
      switchMap(([currentCenter, isAuthenticated]: [ICentre, boolean]) => {
        if (!!currentCenter && isAuthenticated) {
          const reqClone = request.clone({
            headers: request.headers.set(
              'Tenant',
              `${currentCenter.numero_affaire}`
            ),
          });
          return next.handle(reqClone);
        } else {
          return next.handle(request);
        }
      })
    );
  }
}
