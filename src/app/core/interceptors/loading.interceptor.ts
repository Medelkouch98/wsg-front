import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as settingsActions from '../store/settings/settings.actions';
import { finalize } from 'rxjs/operators';
import { AppState } from '../store/app.state';

@Injectable()
export class LoadingScreenInterceptor implements HttpInterceptor {
  activeRequests = 0;
  skipUrls: string[] = ['broadcasting/auth', 'files', 'etats/export'];

  constructor(private store: Store<AppState>) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !this.skipUrls.filter((skipUrl: string) => request.url.includes(skipUrl))
        .length
    ) {
      if (this.activeRequests === 0) {
        this.store.dispatch(settingsActions.StartLoadingHttpAction());
      }
      this.activeRequests++;

      return next.handle(request).pipe(
        finalize(() => {
          this.activeRequests--;
          if (this.activeRequests === 0) {
            this.store.dispatch(settingsActions.StopLoadingHttpAction());
          }
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
