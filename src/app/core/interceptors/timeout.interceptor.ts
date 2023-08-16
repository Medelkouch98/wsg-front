import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable({
  providedIn: 'root',
})
export class TimeoutHttpInterceptor implements HttpInterceptor {
  filtredUrl = ['/geo'];

  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const newReq = req.clone();
    const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
    const timeoutValueNumeric = Number(timeoutValue);
    if (
      this.filtredUrl.filter((url: string) => newReq.url.includes(url)).length >
      0
    ) {
      return next.handle(newReq).pipe(
        timeout(timeoutValueNumeric),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            console.error('Timeout has occurred', req.url);
          }
          return throwError(err);
        })
      );
    }
    return next.handle(newReq);
  }
}
