export interface IClientProContact {
  id?: number;
  civilite_id: number;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
  fixe: string;
  mobile: string;
  recoit_bl: boolean;
  recoit_commercial: boolean;
  recoit_facture: boolean;
  recoit_relance: boolean;
  client_pro_id: number;
}

export class ClientProContact implements IClientProContact {
  id?: number;
  civilite_id: number;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
  fixe: string;
  mobile: string;
  recoit_bl: boolean;
  recoit_commercial: boolean;
  recoit_facture: boolean;
  recoit_relance: boolean;
  client_pro_id: number;

  constructor() {
    this.civilite_id = null;
    this.nom = null;
    this.prenom = null;
    this.email = null;
    this.fonction = null;
    this.fixe = null;
    this.mobile = null;
    this.recoit_bl = false;
    this.recoit_commercial = false;
    this.recoit_facture = false;
    this.recoit_relance = false;
  }
}
