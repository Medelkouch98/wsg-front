import { Component, Injector, OnDestroy } from '@angular/core';
import { ClotureCaisseSearchFormComponent } from './cloture-caisse-search-form/cloture-caisse-search-form.component';
import { ClotureCaisseSearchTableComponent } from './cloture-caisse-search-table/cloture-caisse-search-table.component';
import { ClotureCaisseDateSelectorPopupComponent } from './cloture-caisse-date-selector-popup/cloture-caisse-date-selector-popup.component';
import { ActionsButtonsComponent } from '@app/components';
import { IActionsButton } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClotureCaisseStore } from '../../cloture-caisse.store';
import { Subscription } from 'rxjs';
import { IClotureCaisseSearchResponse } from '../../models';

@Component({
  selector: 'app-cloture-caisse-search',
  standalone: true,
  imports: [
    ClotureCaisseSearchFormComponent,
    ClotureCaisseSearchTableComponent,
    ClotureCaisseDateSelectorPopupComponent,
    ActionsButtonsComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    ></app-actions-buttons>
    <app-cloture-caisse-search-form></app-cloture-caisse-search-form>
    <app-cloture-caisse-search-table></app-cloture-caisse-search-table>
  `,
})
export class ClotureCaisseSearchComponent implements OnDestroy {
  subscription = new Subscription();
  public buttons: IActionsButton[] = [
    {
      libelle: 'gestion.clotureCaisse.cloturerCaisse',
      direction: DirectionEnum.RIGHT,
      action: 'showCloturePopup',
      permissions: [PermissionType.WRITE],
    },
    {
      libelle: 'commun.parametrage',
      direction: DirectionEnum.RIGHT,
      action: 'goToSettings',
      icon: 'settings',
      customColor: 'grey',
      permissions: [PermissionType.WRITE],
      display:false//TODO:show the button when the settings page is created
    },
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private clotureCaisseStore: ClotureCaisseStore
  ) {}

  /**
   * gestion des actions
   * @param action string
   */
  public handleActions(action: string): void {
    switch (action) {
      case 'showCloturePopup':
        this.cloturerCaisse();
        break;
      case 'goToSettings':
        this.clotureCaisseStore.goToClotureCaisseSettings();
        break;
    }
  }

  /**
   * clôturer la caisse
   */
  public cloturerCaisse(): void {
    this.clotureCaisseStore.getLastClotureCaisse({
      action: (clotureCaisseSearchResponse: IClotureCaisseSearchResponse) => {
        this.dialog.open(ClotureCaisseDateSelectorPopupComponent, {
          injector: Injector.create({
            providers: [
              {
                provide: ClotureCaisseStore,
                useValue: this.clotureCaisseStore,
              },
            ],
          }),
          data: clotureCaisseSearchResponse,
          disableClose: true,
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
