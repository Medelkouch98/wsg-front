import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { filter, Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';
import { SetSessionID } from '../store/auth/auth.actions';
import * as authSelectors from '../store/auth/auth.selectors';
import { tap } from 'rxjs/operators';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  sessionId: string;

  constructor(private store: Store<AppState>) {
    this.store
      .pipe(
        select(authSelectors.SessionIDSelector),
        filter(
          (sessionId: string) => !sessionId || sessionId !== this.sessionId
        ),
        tap((sessionId: string) => {
          if (sessionId) {
            this.sessionId = sessionId;
          } else {
            // Générer un identifiant unique
            this.sessionId = uuidv4();
            this.store.dispatch(SetSessionID({ sessionId: this.sessionId }));
          }
        })
      )
      .subscribe();
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(
      request.clone({
        setHeaders: {
          'Session-ID': this.sessionId,
        },
      })
    );
  }
}
