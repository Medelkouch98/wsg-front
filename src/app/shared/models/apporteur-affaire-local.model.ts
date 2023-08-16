import { ITarification } from '../../features/commercial/tarification/models';
import { IApporteurAffaireContact } from '../../features/commercial/apporteur-affaire/models';
import { TypeApporteurAffaire } from '@app/config';

export interface IApporteurAffaireLocal {
  id: number;
  civilite_id: number;
  nom: string;
  code: number;
  actif: boolean;
  adresse: string;
  suite: string;
  cp: string;
  ville: string;
  fixe: string;
  email: string;
  fax: string;
  mobile: string;
  pourcentage_remise: number;
  contacts: IApporteurAffaireContact[];
  prestations: ITarification[];
  type: TypeApporteurAffaire;
}
export class ApporteurAffaireLocal implements IApporteurAffaireLocal {
  actif: boolean;
  adresse: string;
  civilite_id: number;
  code: number;
  contacts: IApporteurAffaireContact[];
  cp: string;
  email: string;
  fax: string;
  id: number;
  mobile: string;
  nom: string;
  pourcentage_remise: number;
  prestations: ITarification[];
  suite: string;
  fixe: string;
  type: TypeApporteurAffaire;
  ville: string;
  constructor() {
    this.actif = true;
    this.adresse = null;
    this.civilite_id = null;
    this.code = null;
    this.contacts = [];
    this.cp = null;
    this.email = null;
    this.fax = null;
    this.id = null;
    this.mobile = null;
    this.nom = null;
    this.pourcentage_remise = 0;
    this.prestations = [];
    this.suite = null;
    this.fixe = null;
    this.type = null;
    this.ville = null;
  }
}
