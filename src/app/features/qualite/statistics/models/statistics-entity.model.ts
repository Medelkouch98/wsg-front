import { StatisticsEntityTypeEnum } from '../enum';

export interface IStatisticsEntity {
  name: string;
  description?: string;
  agrement: string;
  icon: 'store_mall_directory' | 'perm_identity' | 'summarize';
  inactif?: boolean;
  type: StatisticsEntityTypeEnum;
}
