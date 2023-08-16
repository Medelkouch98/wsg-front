import { Component } from '@angular/core';
import { IActionsButton } from '@app/models';
import { ActionsButtonsComponent } from '@app/components';
import { DirectionEnum, PermissionType } from '@app/enums';
import { ReglementSearchFormComponent } from './reglement-search-form/reglement-search-form.component';
import { ReglementSearchTableComponent } from './reglement-search-table/reglement-search-table.component';
import { ReglementStore } from '../../reglement.store';

@Component({
  selector: 'app-reglement-search',
  standalone: true,
  imports: [
    ActionsButtonsComponent,
    ReglementSearchFormComponent,
    ReglementSearchTableComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleAction($event)"
    ></app-actions-buttons>
    <app-reglement-search-form></app-reglement-search-form>
    <app-reglement-search-table></app-reglement-search-table>
  `,
})
export class ReglementSearchComponent {
  public buttons: IActionsButton[] = [
    {
      libelle: 'gestion.reglements.creerUnReglement',
      direction: DirectionEnum.RIGHT,
      action: 'addReglement',
      permissions: [PermissionType.WRITE],
    },
    {
      libelle: 'commun.exportPdf',
      direction: DirectionEnum.LEFT,
      action: 'exportPDF',
      icon: 'picture_as_pdf',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
    {
      libelle: 'commun.exportXls',
      direction: DirectionEnum.LEFT,
      action: 'exportXLS',
      icon: 'print',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
  ];

  constructor(private reglementStore: ReglementStore) {}

  /**
   * Gestion d'action(s) : Output de ActionButtons
   * @param {string} action
   */
  public handleAction(action: string): void {
    switch (action) {
      case 'exportXLS':
        this.reglementStore.exportReglementsXLS();
        break;
      case 'exportPDF':
        this.reglementStore.exportReglementsPDF();
        break;
      case 'addReglement':
        this.reglementStore.goToAddReglement();
        break;
    }
  }
}
