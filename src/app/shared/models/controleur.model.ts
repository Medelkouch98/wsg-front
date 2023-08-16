export interface IControleur {
  id?: number;
  nom?: string;
  prenom?: string;
  utilisateur_id?: number;
  telephone?: string;
  email?: string;
  actif?: boolean;
  agrement_vl: string;
  centres_controle: number[];
  date_debut_agrement: Date | string;
  date_fin_agrement: Date | string;
  agrement_centre_rattachement: string;
  adresse: string;
  suite: string;
  ville: string;
  cp: number;
  habilitation_gaz: boolean;
  habilitation_electrique: boolean;
  reset_password: boolean;
}
export class Controleur implements IControleur {
  agrement_vl: string;
  centres_controle: number[];
  date_debut_agrement: Date | string;
  date_fin_agrement: Date | string;
  agrement_centre_rattachement: string;
  adresse: string;
  suite: string;
  ville: string;
  cp: number;
  habilitation_gaz: boolean;
  habilitation_electrique: boolean;
  reset_password: boolean;
  constructor() {
    this.agrement_vl = null;
    this.centres_controle = [];
    this.date_debut_agrement = null;
    this.date_fin_agrement = null;
    this.agrement_centre_rattachement = null;
    this.adresse = null;
    this.suite = null;
    this.ville = null;
    this.cp = null;
    this.habilitation_gaz = false;
    this.habilitation_electrique = true;
    this.reset_password = false;
  }
}
