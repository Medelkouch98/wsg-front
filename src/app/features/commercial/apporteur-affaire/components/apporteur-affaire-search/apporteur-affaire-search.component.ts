import { Component } from '@angular/core';
import { IActionsButton, IStatisticCardData } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { ApporteurAffaireStore } from '../../apporteur-affaire.store';
import { Observable } from 'rxjs';
import { ApporteurAffaireSearchTableComponent } from './apporteur-affaire-search-table/apporteur-affaire-search-table.component';
import { ApporteurAffaireSearchFormComponent } from './apporteur-affaire-search-form/apporteur-affaire-search-form.component';
import {
  ActionsButtonsComponent,
  StatisticCardComponent,
} from '@app/components';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-apporteur-affaire-search',
  standalone: true,
  imports: [
    AsyncPipe,
    ApporteurAffaireSearchFormComponent,
    ApporteurAffaireSearchTableComponent,
    ActionsButtonsComponent,
    StatisticCardComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleAction($event)"
    ></app-actions-buttons>
    <app-statistic-card
      [statisticsCardsData]="apporteurAffaireStatistics$ | async"
    ></app-statistic-card>
    <app-apporteur-affaire-search-form></app-apporteur-affaire-search-form>
    <app-apporteur-affaire-search-table></app-apporteur-affaire-search-table>
  `,
})
export class ApporteurAffaireSearchComponent {
  public buttons: IActionsButton[] = [
    {
      libelle: 'commercial.apporteurAffaire.addApporteurLocal',
      direction: DirectionEnum.RIGHT,
      action: 'addApporteurLocal',
      permissions: [PermissionType.WRITE],
    },
  ];
  public apporteurAffaireStatistics$: Observable<IStatisticCardData[]> =
    this.apporteurAffaireStore.ApporteurAffaireStatistics$;

  constructor(private apporteurAffaireStore: ApporteurAffaireStore) {
    this.apporteurAffaireStore.GetApporteursStatistics();
  }

  /*
   * Gestion d'action(s) : Output de ActionButtons
   * */
  public handleAction($event: string): void {
    if ($event !== 'addApporteurLocal') return;
    // ouverture de l'interface ajout d'apporteur d'affaire local
    this.apporteurAffaireStore.GoToApporteurLocalAdd();
  }
}
