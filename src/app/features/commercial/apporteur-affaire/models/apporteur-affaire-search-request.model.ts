import { DEFAULT_TYPE_APPORTEUR, TypeApporteurAffaire } from '@app/config';

export interface IApporteurAffaireSearchForm {
  code: string;
  type: TypeApporteurAffaire;
  nom: string;
  actif: string;
}

export class ApporteurAffaireSearchForm implements IApporteurAffaireSearchForm {
  code: string;
  type: TypeApporteurAffaire;
  nom: string;
  actif: string;
  constructor() {
    this.code = '';
    this.type = DEFAULT_TYPE_APPORTEUR;
    this.nom = '';
    this.actif = '';
  }
}
