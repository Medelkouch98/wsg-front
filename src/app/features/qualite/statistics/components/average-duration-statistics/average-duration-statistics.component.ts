import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { StatisticsStore } from '../../statistics.store';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Observable, tap } from 'rxjs';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AverageDurationStatisticsTableComponent } from './average-duration-statistics-table/average-duration-statistics-table.component';
import {
  IAverageDurationStatisticsResponse,
  IStatisticsEntity,
} from '../../models';
import { TranslateModule } from '@ngx-translate/core';
import { StatisticsEntityTypeEnum, StatisticsTypeEnum } from '../../enum';

@Component({
  selector: 'app-average-duration-statistics',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    MatExpansionModule,
    MatIconModule,
    TranslateModule,
    AverageDurationStatisticsTableComponent,
  ],
  templateUrl: './average-duration-statistics.component.html',
})
export class AverageDurationStatisticsComponent implements OnInit {
  @Input() public entity: IStatisticsEntity;
  @Input() public expanded = false;

  @ViewChild('averageDurationPanel') averageDurationPanel: MatExpansionPanel;

  public averageDurationStatistics$: Observable<
    IAverageDurationStatisticsResponse[]
  >;
  public statisticsErrors$: Observable<StatisticsTypeEnum>;

  public openAverageDurationPanel = false;
  public statisticsEntityTypeEnum = StatisticsEntityTypeEnum;

  constructor(private statisticsStore: StatisticsStore) {}

  /**
   * Set up observable for averageDurationStatistics$.
   * Set up an observable for error handling, which will close the relevant panel.
   */
  ngOnInit(): void {
    this.averageDurationStatistics$ =
      this.statisticsStore.averageDurationStatistics$(this.entity.agrement);

    this.statisticsErrors$ = this.statisticsStore
      .statisticsErrors$(this.entity.agrement)
      .pipe(
        tap((errorType: StatisticsTypeEnum) => {
          if (errorType === StatisticsTypeEnum.AverageDuration) {
            this.averageDurationPanel?.close();
          }
          this.statisticsStore.resetStatisticsErrors();
        })
      );
  }

  /**
   * getAverageDurationStatistics calls the getAverageDurationStatistics method of the statisticsStore with a timeout of 0ms.
   * Action is added to the queue to be executed after all other actions have completed, specifically when the view has been checked as it is triggered by opening a card.
   * @param {IStatisticsEntity} entity - The entity to retrieve the control statistics for.
   * @returns void
   */
  public getAverageDurationStatistics(entity: IStatisticsEntity): void {
    setTimeout(
      () => this.statisticsStore.getAverageDurationStatistics(entity),
      0
    );
  }
}
