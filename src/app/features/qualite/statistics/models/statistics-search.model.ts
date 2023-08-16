import * as moment from 'moment';
import { StatisticsModuleEnum } from '../enum';

export interface IStatisticsSearch {
  date_debut: string | Date;
  date_fin: string | Date;
  module: StatisticsModuleEnum;
  type?: 'pdf' | 'xls';
}

export class StatisticsSearch implements IStatisticsSearch {
  date_debut: string | Date;
  date_fin: string | Date;
  module: StatisticsModuleEnum;

  constructor() {
    this.date_debut = moment().add(-1, 'month').toDate();
    this.date_fin = moment().toDate();
    this.module = StatisticsModuleEnum.Activity;
  }
}
