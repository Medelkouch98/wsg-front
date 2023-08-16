import { IControleur } from '@app/models';

export interface IUser {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  civilite_id: number;
  centres: { id: number; role_id: number }[];
  login: string;
  actif: boolean;
  mobile: string;
  is_controleur: boolean;
  desactivation_motif_id: number;
  desactivation_motif_text: string;
  controleur?: IControleur;
  menu_favoris?: string;
  recherche_avancee_options?: string;
}

export class User implements IUser {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  civilite_id: number;
  centres: { id: number; role_id: number }[];
  centres_controle: number[];
  login: string;
  actif: boolean;
  mobile: string;
  is_controleur: boolean;
  desactivation_motif_id: number;
  desactivation_motif_text: string;
  menu_favoris: string;
  recherche_avancee_options?: string;

  constructor() {
    this.nom = null;
    this.prenom = null;
    this.email = null;
    this.civilite_id = null;
    this.centres = [];
    this.login = null;
    this.actif = true;
    this.mobile = null;
    this.desactivation_motif_id = null;
    this.desactivation_motif_text = null;
    this.is_controleur = false;
    this.menu_favoris = null;
    this.recherche_avancee_options = null;
  }
}
