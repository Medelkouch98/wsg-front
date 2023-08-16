export interface IBlocControl {
  type_controle_libelle: string;
  numero_rapport: string;
  date_edition: string;
  numero_liasse: string;
  resultat_libelle: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  type_prochain_controle_code: string;
  controleur_nom: string;
  observation: string;
}
export class BlocControl implements IBlocControl {
  type_controle_libelle: string;
  numero_rapport: string;
  date_edition: string;
  numero_liasse: string;
  resultat_libelle: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  type_prochain_controle_code: string;
  controleur_nom: string;
  observation: string;

  constructor() {
    this.type_controle_libelle = '';
    this.numero_rapport = '';
    this.date_edition = '';
    this.numero_liasse = '';
    this.resultat_libelle = '';
    this.date_validite_vtp = '';
    this.date_validite_vtc = '';
    this.type_prochain_controle_code = '';
    this.controleur_nom = '';
    this.observation = '';
  }
}
