import { IActivityStatistics, ICalendarColonne } from '.';

export interface IDailyActivityCalendarResponse {
  calendar_colonnes: ICalendarColonne[];
  raison_sociale: string;
  agrement: string;
  statistics: IActivityStatistics;
}
export class DailyActivityCalendarResponse
  implements IDailyActivityCalendarResponse
{
  agrement: string;
  calendar_colonnes: ICalendarColonne[];
  raison_sociale: string;
  statistics: IActivityStatistics;
  constructor() {
    this.calendar_colonnes = [];
    this.raison_sociale = null;
    this.agrement = null;
    this.statistics = null;
  }
}
