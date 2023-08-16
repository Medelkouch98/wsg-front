export interface ISearchCriteria {
  start_date: string | Date;
  end_date: string | Date;
  negocie_en: number;
  client_denomination: string;
  facture_status: number;
  releve: number;
}

export class SearchCriteria implements ISearchCriteria {
  start_date: string | Date;
  end_date: string | Date;
  negocie_en: number;
  client_denomination: string;
  facture_status: number;
  releve: number;

  constructor() {
    const today = new Date();
    this.start_date = new Date(today.getFullYear(), today.getMonth(), 1); //le 1er jour du mois
    this.end_date = new Date(today.getFullYear(), today.getMonth() + 1, 0); //le dernier jour du mois
    this.negocie_en = -1;
    this.client_denomination = '';
    this.facture_status = -1;
    this.releve = 1;
  }
}
