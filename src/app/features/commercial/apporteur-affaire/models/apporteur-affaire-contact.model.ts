export interface IApporteurAffaireContact {
  id: number;
  nom: string;
  prenom: string;
  fixe: string;
  mobile: string;
  email: string;
  fonction: string;
  civilite_id: number;
}
export class ApporteurAffaireContact implements IApporteurAffaireContact {
  civilite_id: number;
  email: string;
  fixe: string;
  fonction: string;
  id: number;
  mobile: string;
  nom: string;
  prenom: string;
  constructor() {
    this.civilite_id = null;
    this.email = null;
    this.fixe = null;
    this.fonction = null;
    this.id = null;
    this.mobile = null;
    this.nom = null;
    this.prenom = null;
  }
}
