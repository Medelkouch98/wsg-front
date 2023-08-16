export interface ISearchCriteria {
  date_debut: string | Date;
  date_fin: string | Date;
  fin_mois: boolean;
}

export class SearchCriteria implements ISearchCriteria {
  date_debut: string | Date;
  date_fin: string | Date;
  fin_mois: boolean;

  constructor() {
    this.date_debut = new Date();
    this.date_debut.setDate(1); // first day of the current month
    this.date_fin = new Date(); // today's date

    this.fin_mois = false;
  }
}
