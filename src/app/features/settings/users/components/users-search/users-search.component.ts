import { Component, ViewChild, inject } from '@angular/core';
import { DirectionEnum, PermissionType } from '@app/enums';
import { IActionsButton } from '@app/models';
import { UsersStore } from '../../users.store';
import { UsersSearchFormComponent } from './users-search-form/users-search-form.component';
import { Router } from '@angular/router';
import { UsersSearchTableComponent } from './users-search-table/users-search-table.component';
import { ActionsButtonsComponent } from '@app/components';
import { IUsersSearch } from '../../models';

@Component({
  selector: 'app-users-search',
  standalone: true,
  imports: [
    UsersSearchFormComponent,
    UsersSearchTableComponent,
    ActionsButtonsComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    />
    <app-users-search-form />
    <app-users-search-table />
  `,
})
export class UsersSearchComponent {
  public usersStore = inject(UsersStore);
  public router = inject(Router);
  public buttons: IActionsButton[] = [
    {
      libelle: 'commun.exportPdf',
      direction: DirectionEnum.LEFT,
      action: 'exportPdf',
      icon: 'picture_as_pdf',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
    {
      libelle: 'users.addUser',
      direction: DirectionEnum.RIGHT,
      action: 'addUser',
      permissions: [PermissionType.WRITE],
    },
  ];

  @ViewChild(UsersSearchFormComponent)
  private searchFormComponent: UsersSearchFormComponent;

  /**
   * Handle the given action.
   * @param {string} action - The action to handle. Possible values are 'exportPdf' and 'addUser'.
   */
  public handleActions(action: 'exportPdf' | 'addUser'): void {
    switch (action) {
      case 'exportPdf':
        const searchForm: IUsersSearch =
          this.searchFormComponent.searchForm.getRawValue();
        this.usersStore.exportPdfUsers(searchForm);
        break;
      case 'addUser':
        this.router.navigate(['/p/settings/users/add']);
    }
  }
}
