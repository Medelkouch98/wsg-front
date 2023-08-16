import { IApporteurAffaireNationalRemise } from '../../features/commercial/apporteur-affaire/models/apporteur_affaire-national-remise.model';
import { TypeApporteurAffaire } from '@app/config';

export interface IApporteurAffaireNational {
  id: number;
  civilite_id?: number;
  nom: string;
  code: number;
  actif: boolean;
  adresse?: string;
  suite?: string;
  cp?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  fax?: string;
  mobile?: string;
  type: TypeApporteurAffaire;
  remises: IApporteurAffaireNationalRemise[];
}
export class ApporteurAffaireNational implements IApporteurAffaireNational {
  actif: boolean;
  adresse: string;
  civilite_id: number;
  code: number;
  cp: string;
  email: string;
  fax: string;
  id: number;
  mobile: string;
  nom: string;
  suite: string;
  telephone: string;
  type: TypeApporteurAffaire;
  ville: string;
  remises: IApporteurAffaireNationalRemise[];
  constructor() {
    this.actif = true;
    this.adresse = null;
    this.civilite_id = null;
    this.code = null;
    this.cp = null;
    this.email = null;
    this.fax = null;
    this.id = null;
    this.mobile = null;
    this.nom = null;
    this.suite = null;
    this.telephone = null;
    this.type = null;
    this.ville = null;
    this.remises = [];
  }
}
