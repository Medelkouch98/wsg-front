import { Component, inject } from '@angular/core';
import { DirectionEnum, PermissionType } from '@app/enums';
import { IActionsButton } from '@app/models';
import { RolesSearchFormComponent } from './roles-search-form/roles-search-form.component';
import { RolesSearchTableComponent } from './roles-search-table/roles-search-table.component';
import { ActionsButtonsComponent } from '@app/components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    RolesSearchFormComponent,
    RolesSearchTableComponent,
    ActionsButtonsComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    />
    <app-roles-search-form />
    <app-roles-search-table />
  `,
})
export class RolesSearchComponent {
  private router = inject(Router);

  public buttons: IActionsButton[] = [
    {
      libelle: 'roles.addRole',
      direction: DirectionEnum.RIGHT,
      action: 'addRole',
      permissions: [PermissionType.WRITE],
    },
  ];

  /**
   * Handle the given action.
   * @param {string} action - The action to handle. Possible values are 'addRole'.
   */
  public handleActions(action: 'addRole'): void {
    switch (action) {
      case 'addRole':
        this.router.navigate(['/p/settings/roles/add']);
        break;
    }
  }
}
