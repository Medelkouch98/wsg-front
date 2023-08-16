import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { IActionsButton } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import { StatisticsModuleEnum } from '../enum';
import { StatisticsStore } from '../statistics.store';
import { ActionsButtonsComponent } from '@app/components';
import { StatisticsSearchFormComponent } from './statistics-search-form/statistics-search-form.component';
import { ActivityStatisticsComponent } from './activity-statistics/activity-statistics.component';
import { AverageDurationStatisticsComponent } from './average-duration-statistics/average-duration-statistics.component';
import { DefectStatisticsComponent } from './defect-statistics/defect-statistics.component';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { IStatisticsEntity, IStatisticsSearch } from '../models';
import { StatisticsService } from '../services/statistics.service';
import * as moment from 'moment';
import { NoDataSearchDirective } from '@app/directives';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  standalone: true,
  imports: [
    ActionsButtonsComponent,
    StatisticsSearchFormComponent,
    ActivityStatisticsComponent,
    AverageDurationStatisticsComponent,
    DefectStatisticsComponent,
    NgFor,
    NgIf,
    AsyncPipe,
    MatExpansionModule,
    MatCardModule,
    TranslateModule,
    NoDataSearchDirective,
  ],
  providers: [StatisticsStore, StatisticsService],
})
export class StatisticsComponent {
  @ViewChild(StatisticsSearchFormComponent)
  private searchFormComponent: StatisticsSearchFormComponent;

  public buttons: IActionsButton[] = [
    {
      libelle: 'commun.exportPdf',
      direction: DirectionEnum.LEFT,
      action: 'exportPdf',
      icon: 'picture_as_pdf',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
    {
      libelle: 'commun.exportXls',
      direction: DirectionEnum.LEFT,
      action: 'exportXls',
      icon: 'print',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
  ];

  public entities$: Observable<IStatisticsEntity[]> =
    this.statisticsStore.entities$;
  public searchClicked$: Observable<boolean> =
    this.statisticsStore.searchClicked$;

  public selectedStatisticsModule$: Observable<StatisticsModuleEnum> =
    this.statisticsStore.selectedStatisticsModule$;

  public statisticsModuleEnum = StatisticsModuleEnum;
  constructor(private statisticsStore: StatisticsStore) {}

  /**
   * Handle the given action.
   * @param {string} action - The action to handle. Possible values are 'exportPdf' and 'exportXls'.
   */
  public handleActions(action: 'exportPdf' | 'exportXls'): void {
    const exportTypes = { exportPdf: <const>'pdf', exportXls: <const>'xls' };

    const searchFormValue = this.searchFormComponent.searchForm.getRawValue();
    if (searchFormValue.date_debut) {
      searchFormValue.date_debut = moment(searchFormValue.date_debut).format(
        'YYYY-MM-DD'
      );
    }
    if (searchFormValue.date_fin) {
      searchFormValue.date_fin = moment(searchFormValue.date_fin).format(
        'YYYY-MM-DD'
      );
    }

    const searchForm: IStatisticsSearch = {
      ...searchFormValue,
      type: exportTypes[action],
    };
    this.statisticsStore.exportStatistics(searchForm);
  }
}
