import * as moment from 'moment';

export interface ISearchCriteria {
  month: number;
  year: number;
  state: string;
  niveau: number;
  agrement_controleur: string;
}

export class SearchCriteria implements ISearchCriteria {
  month: number;
  year: number;
  state: string;
  niveau: number;
  agrement_controleur: string;

  constructor() {
    this.month = moment().subtract(1, 'month').month() + 1; //par default on sélectionne le mois n-1
    this.year = moment().year();
    this.state = 'unjustified';
    this.niveau = -1;
    this.agrement_controleur = null;
  }
}
