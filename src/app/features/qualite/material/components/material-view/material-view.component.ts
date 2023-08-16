import { Component, OnInit, inject, OnDestroy, Injector } from '@angular/core';
import { MaterialStore } from '../../material.store';
import { MaterialFormComponent } from '../material-form/material-form.component';
import {
  ActionsButtonsComponent,
  ConfirmationPopupComponent,
} from '@app/components';
import { IActionsButton } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable, filter, map, take, tap, withLatestFrom } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AccessPermissionsSelector } from 'app/core/store/auth/auth.selectors';
import { AppState } from 'app/core/store/app.state';
import {
  CONNECTED_MATERIAL_CATEGORY_ID,
  IMaterial,
  IMaterialEvent,
  IMaterialSubType,
} from '../../models';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MaterialAlertsComponent } from './material-alerts/material-alerts.component';
import { MaterialEventFormPopupComponent } from '../material-form/material-event-form-popup/material-event-form-popup.component';
import * as moment from 'moment';

/**
 * Component for viewing material details.
 */
@Component({
  selector: 'app-material-view',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    MaterialAlertsComponent,
    MaterialFormComponent,
    ActionsButtonsComponent,
  ],
  template: `
    <ng-container *ngIf="materialViewData | async as _">
      <app-material-alerts />
      <app-actions-buttons
        *ngIf="buttons.length"
        [actionButtons]="buttons"
        (action)="handleActions($event)"
      />
      <app-material-form
        *ngIf="subType"
        [addMode]="false"
        [isReadOnly]="_.isReadOnly"
        (popUpEventForm)="popUpEventForm($event, _.isReadOnly)"
      />
    </ng-container>
  `,
})
export class MaterialViewComponent implements OnInit, OnDestroy {
  private materialStore = inject(MaterialStore);
  public store = inject(Store<AppState>);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);

  public buttons: IActionsButton[] = [];
  public subTypes$: Observable<IMaterialSubType[]> =
    this.materialStore.subTypes$;
  public material$: Observable<IMaterial> = this.materialStore.material$;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );

  public materialViewData: Observable<{
    material: IMaterial;
    subTypes: IMaterialSubType[];
    isReadOnly: boolean;
  }>;
  public subType: IMaterialSubType;

  ngOnInit(): void {
    this.materialStore.getMaterial();
    this.materialStore.getMaterialAlerts();

    // Subscribe to the material details and user permissions
    this.materialViewData = this.material$.pipe(
      withLatestFrom(this.subTypes$, this.isReadOnly$),
      filter(
        ([material]: [IMaterial, IMaterialSubType[], boolean]) => !!material
      ), // Filter out empty material details
      map(
        ([material, subTypes, isReadOnly]: [
          IMaterial,
          IMaterialSubType[],
          boolean
        ]) => {
          this.subType = subTypes.find(
            ({ id }) => id === material.materiel_sous_type_id
          );

          // Set up the action buttons based on the material details and user permissions
          this.buttons = [
            {
              libelle: 'qualite.material.deleteMaterial',
              direction: DirectionEnum.RIGHT,
              action: 'deleteMaterial',
              permissions: [PermissionType.WRITE],
              color: 'warn',
              display:
                material?.materiel_categorie_id !==
                CONNECTED_MATERIAL_CATEGORY_ID,
            },
            {
              libelle: 'qualite.material.addEvent',
              direction: DirectionEnum.RIGHT,
              action: 'addEvent',
              permissions: [PermissionType.WRITE],
              display: !isReadOnly,
            },
            {
              libelle: 'commun.exportPdf',
              direction: DirectionEnum.LEFT,
              action: 'exportPdf',
              icon: 'picture_as_pdf',
              customColor: 'green',
              permissions: [PermissionType.EXPORT],
            },
          ];
          return { material, subTypes, isReadOnly };
        }
      )
    );
  }

  /**
   * Handles the actions triggered by the action buttons.
   * @param action The action to be performed.
   */
  public handleActions(
    action: 'exportPdf' | 'addEvent' | 'deleteMaterial'
  ): void {
    switch (action) {
      case 'exportPdf':
        this.materialStore.exportPdfMaterial();
        break;
      case 'addEvent':
        this.popUpEventForm();
        break;
      case 'deleteMaterial':
        this.deleteMaterial();
        break;
    }
  }

  /**
   * Deletes the material by displaying a confirmation popup.
   */
  public deleteMaterial(): void {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('commun.deleteConfirmation'),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((res: boolean) => !!res),
        tap(() => this.materialStore.deleteMaterial())
      )
      .subscribe();
  }

  /**
   * Opens the event form popup.
   * @param openedEvent - The event to be opened.
   * @param isReadOnly - Indicates whether the form is read-only.
   */
  public popUpEventForm(
    openedEvent: IMaterialEvent = null,
    isReadOnly: boolean = false
  ): void {
    this.materialStore.patchState({ openedEvent });
    this.dialog
      .open(MaterialEventFormPopupComponent, {
        injector: Injector.create({
          providers: [{ provide: MaterialStore, useValue: this.materialStore }],
        }),
        data: {
          materiel_evenement_types: this.subType.materiel_evenement_types,
          isReadOnly,
        },
        width: window.innerWidth > 640 ? '50%' : '100%',
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((event: IMaterialEvent) => !!event),
        tap((event: IMaterialEvent) => {
          this.materialStore.patchState({ openedEvent: null });
          event.date = moment(event.date).format('YYYY-MM-DD');
          if (openedEvent) {
            this.materialStore.updateEvent(event);
          } else {
            this.materialStore.addEvent(event);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.materialStore.initMaterial();
  }
}
