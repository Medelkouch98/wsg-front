import { Component, inject } from '@angular/core';
import { MaterialStore } from '../../../material.store';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { Observable, filter, tap } from 'rxjs';
import { IMaterialAlertResponse } from '../../../models';
import { TranslateService } from '@ngx-translate/core';
import { AlertComponent } from '@app/components';

/**
 * Component for displaying material alerts.
 */
@Component({
  selector: 'app-material-alerts',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, AlertComponent],
  template: `
    <ng-container *ngIf="alerts$ | async">
      <app-alert
        *ngFor="let alert of alerts; let i = index"
        [message]="alert"
        (closeAlert)="removeAlert(i)"
      />
    </ng-container>
  `,
})
export class MaterialAlertsComponent {
  private materialStore = inject(MaterialStore);
  private translateService = inject(TranslateService);
  public alerts: string[] = [];
  public alerts$: Observable<IMaterialAlertResponse> =
    this.materialStore.alerts$.pipe(
      filter((alerts: IMaterialAlertResponse) => !!alerts),
      tap(
        (alerts: IMaterialAlertResponse) =>
          (this.alerts = this.transformMaterialAlertResponse(alerts))
      )
    );

  /**
   * Removes an alert from the alerts array.
   * @param index The index of the alert to be removed.
   */
  public removeAlert(index: number): void {
    this.alerts.splice(index, 1);
  }

  /**
   * Transforms the material alerts response into an array of alert messages.
   * @param materialAlertResponse The material alerts response.
   * @returns An array of alert messages.
   */
  private transformMaterialAlertResponse(
    materialAlertResponse: IMaterialAlertResponse
  ): string[] {
    const result: string[] = [];

    if (materialAlertResponse.required.length) {
      const requiredTypes = materialAlertResponse.required
        .map(({ libelle }) => `"${libelle}"`)
        .join(', ');
      result.push(
        this.translateService.instant('qualite.material.alerts.required', {
          requiredTypes,
        })
      );
    }

    if (materialAlertResponse.required_soon.length) {
      const requiredSoonTypes = materialAlertResponse.required_soon
        .map(({ libelle }) => `"${libelle}"`)
        .join(', ');
      result.push(
        this.translateService.instant('qualite.material.alerts.requiredSoon', {
          requiredSoonTypes,
        })
      );
    }

    if (materialAlertResponse.required_amount.length) {
      const requiredAmounts = materialAlertResponse.required_amount
        .map(({ libelle, occurences_per_year }) =>
          this.translateService.instant(
            'qualite.material.alerts.amountperType',
            { occurences: occurences_per_year, label: `"${libelle}"` }
          )
        )
        .join(', ');
      result.push(
        this.translateService.instant(
          'qualite.material.alerts.requiredAmount',
          { requiredAmounts }
        )
      );
    }

    if (materialAlertResponse.expired.length) {
      const expiredTypes = materialAlertResponse.expired
        .map(({ libelle }) => `"${libelle}"`)
        .join(', ');
      result.push(
        this.translateService.instant('qualite.material.alerts.expired', {
          expiredTypes,
        })
      );
    }

    if (materialAlertResponse.expired_soon.length) {
      const expiredSoonTypes = materialAlertResponse.expired_soon
        .map(({ libelle }) => `"${libelle}"`)
        .join(', ');
      result.push(
        this.translateService.instant('qualite.material.alerts.expiredSoon', {
          expiredSoonTypes,
        })
      );
    }

    return result;
  }
}
