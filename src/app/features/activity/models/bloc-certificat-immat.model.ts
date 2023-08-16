export interface IBlocCertificatImmat {
  immatriculation: string;
  proprietaire_nom: string;
  proprietaire_adresse: string;
  proprietaire_suite: string;
  proprietaire_cp: string;
  proprietaire_ville: string;
  code_pays: string;
  documentPresent: string;
  date_ci: string;
  date_mc: string;
  date_mc_evalue: string;
}

export class BlocCertificatImmat implements IBlocCertificatImmat {
  immatriculation: string;
  proprietaire_nom: string;
  proprietaire_adresse: string;
  proprietaire_suite: string;
  proprietaire_cp: string;
  proprietaire_ville: string;
  code_pays: string;
  documentPresent: string;
  date_ci: string;
  date_mc: string;
  date_mc_evalue: string;

  constructor() {
    this.immatriculation = '';
    this.proprietaire_nom = '';
    this.proprietaire_adresse = '';
    this.proprietaire_suite = '';
    this.proprietaire_cp = '';
    this.proprietaire_ville = '';
    this.code_pays = '';
    this.documentPresent = '';
    this.documentPresent = '';
    this.date_ci = '';
    this.date_mc = '';
    this.date_mc_evalue = '';
  }
}
