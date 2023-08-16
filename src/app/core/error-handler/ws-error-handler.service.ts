import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../notifications/notification.service';
import { Store } from '@ngrx/store';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class WsErrorsHandlerService extends ErrorHandler {
  constructor(
    private notificationsService: NotificationService,
    private injector: Injector,
    private translateService: TranslateService
  ) {
    super();
  }

  handleError(error: Error | HttpErrorResponse): void {
    let displayMessage = this.translateService.instant(_('error.isOccurred'));
    if (!environment.production) {
      displayMessage = `${displayMessage} ${this.translateService.instant(
        _('error.seeConsole')
      )}`;
    }
    if (!navigator.onLine) {
      // No Internet connection
      return this.notificationsService.default(
        this.translateService.instant(_(' error.internetConnection'))
      );
    } else if (
      error instanceof HttpErrorResponse &&
      error.status !== 401 &&
      error.status !== 404
    ) {
      // Server error happened
      this.notificationsService.default(displayMessage);
    } else {
      // Client Error Happend
      this.notificationsService.default(error.message);
    }
    // Log the error anyway
    super.handleError(error);
  }
}
