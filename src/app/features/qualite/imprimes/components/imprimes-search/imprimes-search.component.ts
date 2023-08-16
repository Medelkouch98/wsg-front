import { Component, OnInit } from '@angular/core';
import { IActionsButton, IStatisticCardData } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { ImprimesStore } from '../../imprimes.store';
import { Observable, Subscription, tap } from 'rxjs';
import { ICartonLiasse } from '../../models';
import { ImprimesSearchFormComponent } from './imprimes-search-form/imprimes-search-form.component';
import { ImprimesSearchTableComponent } from './imprimes-search-table/imprimes-search-table.component';
import {
  ActionsButtonsComponent,
  StatisticCardComponent,
} from '@app/components';
import { AsyncPipe, NgIf } from '@angular/common';
import { ImprimesExportTypeEnum, ImprimesTypeFormEnum } from '../../enum';

@Component({
  selector: 'app-search-imprimes',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ImprimesSearchFormComponent,
    ImprimesSearchTableComponent,
    ActionsButtonsComponent,
    StatisticCardComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    ></app-actions-buttons>
    <app-statistic-card
      [statisticsCardsData]="imprimesStatistics$ | async"
    ></app-statistic-card>
    <app-imprimes-search-form></app-imprimes-search-form>
    <app-imprimes-search-table></app-imprimes-search-table>
  `,
})
export class ImprimesSearchComponent implements OnInit {
  imprimesStatistics$: Observable<IStatisticCardData[]> =
    this.imprimesStore.imprimesStatistics$;

  buttons: IActionsButton[] = [];
  subscriptions: Subscription = new Subscription();

  constructor(private imprimesStore: ImprimesStore) {}

  ngOnInit() {
    this.imprimesStore.imprimesSearch();
    this.imprimesStore.imprimesStatistics();
    this.subscriptions.add(
      this.imprimesStore.cartonsLiassesData$
        .pipe(
          tap((data: ICartonLiasse[]) => {
            this.buttons = [
              {
                libelle: 'qualite.imprimes.historiqueImprimesAnnules',
                direction: DirectionEnum.LEFT,
                action: 'exportHistorique',
                icon: 'picture_as_pdf',
                customColor: 'green',
                permissions: [PermissionType.EXPORT],
                display: !!data?.length,
              },
              {
                libelle: 'qualite.imprimes.recapitulatifImprimesAnnules',
                direction: DirectionEnum.LEFT,
                action: 'exportImprimesAnnules',
                icon: 'picture_as_pdf',
                customColor: 'green',
                permissions: [PermissionType.EXPORT],
                display: !!data?.length,
              },
              {
                libelle: 'qualite.imprimes.annulerImpRegl',
                direction: DirectionEnum.RIGHT,
                action: 'cancelImprimes',
                permissions: [PermissionType.WRITE],
              },
              {
                libelle: 'qualite.imprimes.pretImpRegl',
                direction: DirectionEnum.RIGHT,
                action: 'pretImprimes',
                permissions: [PermissionType.WRITE],
              },
            ];
          })
        )
        .subscribe()
    );
  }

  /**
   * gestion des actions
   * @param action string
   */
  public handleActions(action: string): void {
    switch (action) {
      case 'cancelImprimes':
        this.imprimesStore.goToCancelOrPretImp(ImprimesTypeFormEnum.cancel);
        break;
      case 'pretImprimes':
        this.imprimesStore.goToCancelOrPretImp(ImprimesTypeFormEnum.pret);
        break;
      case 'exportHistorique':
        this.imprimesStore.export(ImprimesExportTypeEnum.traite);
        break;
      case 'exportImprimesAnnules':
        this.imprimesStore.export(ImprimesExportTypeEnum.nonTraite);
        break;
    }
  }
}
