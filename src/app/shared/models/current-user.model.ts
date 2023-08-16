import { ICentre } from '@app/models';

export interface ICurrentUser {
  id: number;
  actif: boolean;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  mobile: string;
  civilite_id: number;
  centres: ICentre[];
  is_controleur: boolean;
  desactivation_motif_id: string;
  desactivation_motif_text: string;
  hasFullGroupAccess: boolean;
  menu_favoris: string;
  recherche_avancee_options: string;
}

export class CurrentUser implements ICurrentUser {
  id: number;
  actif: boolean;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  mobile: string;
  civilite_id: number;
  centres: ICentre[];
  is_controleur: boolean;
  desactivation_motif_id: string;
  desactivation_motif_text: string;
  hasFullGroupAccess: boolean;
  menu_favoris: string;
  recherche_avancee_options: string;

  constructor() {
    this.id = null;
    this.nom = null;
    this.prenom = null;
    this.email = null;
    this.mobile = null;
    this.actif = false;
    this.login = null;
    this.civilite_id = null;
    this.centres = [];
    this.is_controleur = false;
    this.desactivation_motif_id = null;
    this.desactivation_motif_text = null;
    this.hasFullGroupAccess = true;
    this.menu_favoris = null;
    this.recherche_avancee_options = null;
  }
}
