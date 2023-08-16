import { TypePersonneEnum } from '@app/enums';

export interface ISearchCriteria {
  date_reglement_start: string | Date;
  date_reglement_end: string | Date;
  mode_reglement_id: number;
  numero_facture: string;
  nom_client: string;
  type_client: TypePersonneEnum;
  reference: string;
}

export class SearchCriteria implements ISearchCriteria {
  date_reglement_start: string | Date;
  date_reglement_end: string | Date;
  mode_reglement_id: number;
  numero_facture: string;
  nom_client: string;
  type_client: TypePersonneEnum;
  reference: string;

  constructor() {
    this.date_reglement_start = '';
    this.date_reglement_end = '';
    this.mode_reglement_id = -1;
    this.numero_facture = '';
    this.nom_client = '';
    this.type_client = TypePersonneEnum.ALL;
    this.reference = '';
  }
}
