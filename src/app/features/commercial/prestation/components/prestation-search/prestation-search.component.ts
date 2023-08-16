import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IActionsButton, IStatisticCardData } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { PrestationSearchTableComponent } from './prestation-search-table/prestation-search-table.component';
import { PrestationSearchFromComponent } from './prestation-search-from/prestation-search-from.component';
import {
  ActionsButtonsComponent,
  StatisticCardComponent,
} from '@app/components';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { PrestationStore } from '../../prestation.store';

@Component({
  selector: 'app-prestation-search',
  standalone: true,
  imports: [
    ActionsButtonsComponent,
    PrestationSearchFromComponent,
    StatisticCardComponent,
    PrestationSearchTableComponent,
    AsyncPipe,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleAction($event)"
    ></app-actions-buttons>
    <app-statistic-card
      [statisticsCardsData]="prestationsStatistics$ | async"
    ></app-statistic-card>
    <app-prestation-search-from></app-prestation-search-from>
    <app-prestation-search-table></app-prestation-search-table>
  `,
})
export class PrestationSearchComponent implements OnInit {
  public buttons: IActionsButton[] = [
    {
      libelle: 'commercial.prestations.addPrestation',
      direction: DirectionEnum.RIGHT,
      action: 'addPrestation',
      permissions: [PermissionType.WRITE],
    },
  ];

  public prestationsStatistics$: Observable<IStatisticCardData[]> =
    this.prestationsStore.PrestationsStatistics$;

  constructor(
    private router: Router,
    private prestationsStore: PrestationStore
  ) {}

  ngOnInit(): void {
    this.prestationsStore.getPrestationsStatistics();
  }

  /*
   * Gestion d'action(s) : Output de ActionButtons
   * */
  public handleAction($event: string): void {
    if ($event !== 'addPrestation') return;
    // ouverture de l'interface ajout de prestation
    this.router.navigate(['/p/commercial/prestations/add/']);
  }
}
