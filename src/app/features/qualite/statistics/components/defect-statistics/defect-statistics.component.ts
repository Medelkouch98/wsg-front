import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { StatisticsStore } from '../../statistics.store';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Observable, tap } from 'rxjs';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { StatisticsTableComponent } from '../statistics-table/statistics-table.component';
import { IDefectStatisticsResponse, IStatisticsEntity } from '../../models';
import { TranslateModule } from '@ngx-translate/core';
import { StatisticsEntityTypeEnum, StatisticsTypeEnum } from '../../enum';

@Component({
  selector: 'app-defect-statistics',
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
  templateUrl: './defect-statistics.component.html',
})
export class DefectStatisticsComponent implements OnInit {
  @Input() public entity: IStatisticsEntity;
  @Input() public expanded = false;

  @ViewChild('defectPanel') defectPanel: MatExpansionPanel;

  public defectStatistics$: Observable<IDefectStatisticsResponse[]>;
  public defectStatisticsColumns: string[] = [
    'label',
    'vtp',
    'cv',
    'vtc',
    'cvc',
    'total',
  ];

  public statisticsErrors$: Observable<StatisticsTypeEnum>;

  public openDefectPanel = false;
  public statisticsEntityTypeEnum = StatisticsEntityTypeEnum;

  constructor(private statisticsStore: StatisticsStore) {}

  /**
   * Set up observable for defectStatistics$.
   * Set up an observable for error handling, which will close the relevant panel.
   */
  ngOnInit(): void {
    this.defectStatistics$ = this.statisticsStore.defectStatistics$(
      this.entity.agrement
    );

    this.statisticsErrors$ = this.statisticsStore
      .statisticsErrors$(this.entity.agrement)
      .pipe(
        tap((errorType: StatisticsTypeEnum) => {
          if (errorType === StatisticsTypeEnum.Defect) {
            this.defectPanel?.close();
          }
          this.statisticsStore.resetStatisticsErrors();
        })
      );
  }

  /**
   * getDefectStatistics calls the getDefectStatistics method of the statisticsStore with a timeout of 0ms.
   * Action is added to the queue to be executed after all other actions have completed, specifically when the view has been checked as it is triggered by opening a card.
   * @param {IStatisticsEntity} entity - The entity to retrieve the control statistics for.
   * @returns void
   */
  public getDefectStatistics(entity: IStatisticsEntity): void {
    setTimeout(() => this.statisticsStore.getDefectStatistics(entity), 0);
  }
}
