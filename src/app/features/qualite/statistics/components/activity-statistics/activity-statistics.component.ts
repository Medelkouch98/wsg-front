import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { StatisticsStore } from '../../statistics.store';
import { AsyncPipe, NgIf, NgClass } from '@angular/common';
import {
  IContreVisiteStatisticsResponse,
  IControlStatisticsResponse,
  IStatisticsEntity,
} from '../../models';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { StatisticsTableComponent } from '../statistics-table/statistics-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, tap } from 'rxjs';
import { StatisticsEntityTypeEnum, StatisticsTypeEnum } from '../../enum';

@Component({
  selector: 'app-activity-statistics',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    MatExpansionModule,
    MatIconModule,
    TranslateModule,
    StatisticsTableComponent,
  ],
  templateUrl: './activity-statistics.component.html',
})
export class ActivityStatisticsComponent implements OnInit {
  @Input() public entity: IStatisticsEntity;
  @Input() public expanded = false;

  @ViewChild('controlPanel') controlPanel: MatExpansionPanel;
  @ViewChild('contreVisitePanel') contreVisitePanel: MatExpansionPanel;

  public controlStatistics$: Observable<IControlStatisticsResponse[]>;
  public controlStatisticsColumns: string[] = [
    'label',
    'vtp',
    'cv',
    'vtc',
    'cvc',
    'vt',
    'vp',
    'total',
  ];

  public contreVisiteStatistics$: Observable<IContreVisiteStatisticsResponse[]>;
  public contreVisiteStatisticsColumns: string[] = [
    'label',
    'vtp',
    'cv',
    'vtc',
    'cvc',
    'total',
  ];

  public statisticsErrors$: Observable<StatisticsTypeEnum>;

  public openControlPanel = false;
  public statisticsEntityTypeEnum = StatisticsEntityTypeEnum;

  constructor(private statisticsStore: StatisticsStore) {}

  /**
   * Set up observables for controlStatistics$ and contreVisiteStatistics$
   * Set up an observable for error handling, which will close the relevant panel.
   */
  ngOnInit(): void {
    this.controlStatistics$ = this.statisticsStore.controlStatistics$(
      this.entity.agrement
    );

    this.contreVisiteStatistics$ = this.statisticsStore.contreVisiteStatistics$(
      this.entity.agrement
    );

    this.statisticsErrors$ = this.statisticsStore
      .statisticsErrors$(this.entity.agrement)
      .pipe(
        tap((errorType: StatisticsTypeEnum) => {
          switch (errorType) {
            case StatisticsTypeEnum.Control:
              this.controlPanel?.close();
              break;
            case StatisticsTypeEnum.ContreVisite:
              this.contreVisitePanel?.close();
              break;
          }
          this.statisticsStore.resetStatisticsErrors();
        })
      );
  }

  /**
   * getControlStatistics calls the getControlStatistics method of the statisticsStore with a timeout of 0ms.
   * Action is added to the queue to be executed after all other actions have completed, specifically when the view has been checked as it is triggered by opening a card.
   * @param {IStatisticsEntity} entity - The entity to retrieve the control statistics for.
   * @returns void
   */
  public getControlStatistics(entity: IStatisticsEntity): void {
    setTimeout(() => this.statisticsStore.getControlStatistics(entity), 0);
  }

  /**
   * getContreVisiteStatistics calls the getContreVisiteStatistics method of the statisticsStore with a timeout of 0ms.
   *
   * @param {IStatisticsEntity} entity - The entity to retrieve the contre-visite statistics for.
   * @returns void
   */
  public getContreVisiteStatistics(entity: IStatisticsEntity): void {
    setTimeout(() => this.statisticsStore.getContreVisiteStatistics(entity), 0);
  }
}
