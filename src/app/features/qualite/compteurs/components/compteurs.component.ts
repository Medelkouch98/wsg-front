import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CompteursStore } from '../compteurs.store';
import {
  ActionsButtonsComponent,
  StatisticCardComponent,
} from '@app/components';
import { CompteursSearchFormComponent } from './compteurs-search-form/compteurs-search-form.component';
import { CompteursSearchTableComponent } from './compteurs-search-table/compteurs-search-table.component';
import { AsyncPipe, KeyValuePipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { IActionsButton, IStatisticCardData } from '@app/models';
import { ICompteurItem } from '../models';
import { CompteursService } from '../services/compteurs.service';

@Component({
  selector: 'app-compteurs',
  standalone: true,
  imports: [
    ActionsButtonsComponent,
    StatisticCardComponent,
    CompteursSearchFormComponent,
    CompteursSearchTableComponent,
    AsyncPipe,
    NgIf,
    KeyValuePipe,
  ],
  template: `
    <app-actions-buttons
      *ngIf="(actionsButtonsSelector$ | async)?.length"
      [actionButtons]="actionsButtonsSelector$ | async"
      (action)="handleAction($event)"
    ></app-actions-buttons>
    <app-statistic-card
      (cardClick)="filtreUnjustifiedCompteurs($event)"
      [statisticsCardsData]="compteursStatistics$ | async"
    ></app-statistic-card>
    <app-compteurs-search-form></app-compteurs-search-form>
    <app-compteurs-search-table></app-compteurs-search-table>
  `,
  providers: [CompteursStore, CompteursService],
})
export class CompteursComponent {
  compteursStatistics$: Observable<IStatisticCardData[]> =
    this.compteursStore.StatisticsSelector$;
  compteurs$: Observable<Record<number, Record<string, ICompteurItem[]>>> =
    this.compteursStore.CompteursSelector$;
  actionsButtonsSelector$: Observable<IActionsButton[]> =
    this.compteursStore.ActionsButtonsSelector$;
  @ViewChild(CompteursSearchFormComponent)
  private compteursSearchFormComponent: CompteursSearchFormComponent;
  @ViewChild(CompteursSearchTableComponent)
  private compteursSearchTableComponent: CompteursSearchTableComponent;

  constructor(private router: Router, private compteursStore: CompteursStore) {}

  /**
   * Gestion d'action(s) : Output de ActionButtons
   * @param {string} $event
   */
  public handleAction($event: string): void {
    if ($event === 'impressionCompteursPDF') {
      this.compteursStore.ExportPDFCompteurs();
    }
    if ($event === 'fichierOTC') {
      this.compteursStore.ExportFichierOTC();
    }
  }

  /**
   * gérer le click sur la carte : Non justifiés(toutes années confondues) : id=4
   * @param {number} cardId
   */
  public filtreUnjustifiedCompteurs(cardId: number) {
    switch (cardId) {
      case 4:
        this.compteursStore.SetCompteursSearchCriteria({
          state: 'unjustified',
          year: -1,
          month: -1,
          niveau: -1,
          agrement_controleur: null,
        });
        this.compteursStore.CompteursSearch();
        break;
      default:
        this.compteursSearchTableComponent.scrollToLevelSection(cardId);
    }
  }
}
