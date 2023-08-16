import { Component, OnInit, inject } from '@angular/core';
import { UsersStore } from '../../users.store';
import { UserFormComponent } from '../user-form/user-form.component';
import { ActionsButtonsComponent } from '@app/components';
import { IActionsButton, IUser } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable, map, tap } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AccessPermissionsSelector } from 'app/core/store/auth/auth.selectors';
import { AppState } from 'app/core/store/app.state';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [NgIf, AsyncPipe, UserFormComponent, ActionsButtonsComponent],
  template: `
    <ng-container
      *ngIf="{
        user: user$ | async,
        exportCertificateEnabled: exportCertificateEnabled$ | async,
        isReadOnly: isReadOnly$ | async
      } as _"
    >
      <app-actions-buttons
        *ngIf="!_.isReadOnly && _.user.is_controleur"
        [actionButtons]="buttons"
        (action)="handleActions($event, _.user)"
      />
      <app-user-form [addMode]="false" />
    </ng-container>
  `,
})
export class UserViewComponent implements OnInit {
  private usersStore = inject(UsersStore);
  public store = inject(Store<AppState>);
  public buttons: IActionsButton[] = [];

  public exportCertificateEnabled$: Observable<boolean> =
    this.usersStore.exportCertificateEnabled$.pipe(
      tap(
        (exportCertificateEnabled: boolean) =>
          (this.buttons = [
            {
              libelle: 'users.exportCertificate',
              direction: DirectionEnum.LEFT,
              action: 'exportCertificateError',
              icon: 'picture_as_pdf',
              customColor: 'green',
              permissions: [PermissionType.EXPORT],
              disabled: !exportCertificateEnabled,
              ...(!exportCertificateEnabled && {
                tooltip: 'users.exportCertificateDisabledMessage',
              }),
            },
            {
              libelle: 'users.updateRNC2',
              direction: DirectionEnum.RIGHT,
              action: 'getRNC2User',
              icon: 'sync',
              permissions: [PermissionType.WRITE],
            },
          ])
      )
    );
  public user$: Observable<IUser> = this.usersStore.user$;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );

  ngOnInit(): void {
    this.usersStore.getUser();
    this.usersStore.checkExploitantCentreExists();
  }

  /**
   * Handle the given action.
   * @param {string} action - The action to handle. Possible values are 'exportCertificateError' and 'getRNC2User'.
   */
  public handleActions(
    action: 'exportCertificateError' | 'getRNC2User',
    user: IUser
  ): void {
    switch (action) {
      case 'exportCertificateError':
        this.usersStore.exportCertificateError();
        break;
      case 'getRNC2User':
        this.usersStore.getRNC2User(user.controleur.agrement_vl);
        break;
    }
  }
}
