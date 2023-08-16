import { IDailyActivityEvent } from '../models';

export interface ICalendarColonne {
  controleur_nom: string;
  controleur_agrement: string;
  events: IDailyActivityEvent[];
}
