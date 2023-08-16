import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly zone: NgZone
  ) {}

  default(message: string): void {
    this.show(message, {
      duration: 2000,
      panelClass: 'default-notification',
    });
  }

  info(message: string): void {
    this.show(message, {
      duration: 2000,
      panelClass: 'info-notification',
    });
  }

  success(message: string): void {
    this.show(message, {
      duration: 3000,
      panelClass: 'success-notification',
    });
  }

  warn(message: string): void {
    this.show(message, {
      duration: 2500,
      panelClass: 'warning-notification',
    });
  }

  error(message: string): void {
    this.show(message, {
      duration: 3000,
      panelClass: 'error-notification',
    });
  }

  private show(message: string, configuration: MatSnackBarConfig): void {
    // Need to open snackBar from Angular zone to prevent issues with its position per
    // https://stackoverflow.com/questions/50101912/snackbar-position-wrong-when-use-errorhandler-in-angular-5-and-material
    this.zone.run(() => this.snackBar.open(message, undefined, configuration));
  }
}
