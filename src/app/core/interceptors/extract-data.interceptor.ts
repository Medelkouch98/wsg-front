import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExtractDataInterceptor implements HttpInterceptor {
  noExtractTypes = ['blob', 'arraybuffer'];
  noExtractUrl: string[] = [];

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (
          event instanceof HttpResponse &&
          this.noExtractTypes.indexOf(request.responseType) === -1 &&
          this.allowUrl(request.url)
        ) {
          if (
            event &&
            event.body &&
            event.body.hasOwnProperty('data') &&
            !event.body['meta']
          ) {
            // change the response body here
            const eventClone: HttpEvent<any> = event.clone({
              body: event.body['data'],
            });
            return eventClone;
          }
        }
        return event;
      })
    );
  }

  allowUrl(url: string) {
    const found = this.noExtractUrl.filter(
      (blockedUrl) => url.indexOf(blockedUrl) !== -1
    );
    return found.length > 0 ? false : true;
  }
}
