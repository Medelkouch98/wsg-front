import * as moment from 'moment';

export interface IControlFiche {
  id: number;
  client_id: number;
  numero_bon_livraison: number;
  facture_numero_facture: string;
  client_code_client: number;
  client_nom: string;
  client_adresse: string;
  client_suite: string;
  client_cp: number;
  client_ville: string;
  client_email: string;
  client_telephone: string;
  apporteurLocal_nom: string;
  apporteurLocal_code: string;
  apporteurNational_nom: string;
  apporteurNational_code: string;
  facture_montant_ttc: string;
  facture_montant_ht: string;
  facture_solde: string;
  immatriculation: string;
  proprietaire_nom: string;
  proprietaire_adresse: string;
  proprietaire_suite: string;
  proprietaire_cp: string;
  proprietaire_ville: string;
  code_pays: string;
  documentPresent: string;
  documentPresent_code: string;
  documentPresent_libelle_secta: string;
  date_ci: string;
  date_mc: string;
  date_mc_evalue: string;
  facture_date_facture: string;
  type_controle_libelle: string;
  numero_rapport: number;
  date_edition: string;
  numero_liasse: string;
  resultat_libelle: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  type_prochain_controle_code: string;
  controleur_nom: string;
  observation: string;
  categorie_libelle: string;
  genre_code: string;
  marque: string;
  modele: string;
  carrosserie_code: string;
  categorie_internationale_code: string;
  energie_code: string;
  puissance_fiscale: number;
  nb_place_assises: number;
  ptac: number;
  poid_a_vide: string;
  numero_liasse_multi_pv: string;
  controleur_agrement_vl: string;
}
export class ControlFiche {
  id: number;
  client_id: number;
  numero_bon_livraison: number;
  facture_numero_facture: string;
  client_code_client: number;
  client_nom: string;
  client_adresse: string;
  client_suite: string;
  client_cp: number;
  client_ville: string;
  client_email: string;
  client_telephone: string;
  apporteurLocal_nom: string;
  apporteurLocal_code: string;
  apporteurNational_nom: string;
  apporteurNational_code: string;
  facture_montant_ttc: string;
  facture_montant_ht: string;
  facture_solde: string;
  immatriculation: string;
  proprietaire_nom: string;
  proprietaire_adresse: string;
  proprietaire_suite: string;
  proprietaire_cp: string;
  proprietaire_ville: string;
  code_pays: string;
  documentPresent: string;
  documentPresent_code: string;
  documentPresent_libelle_secta: string;
  date_ci: string;
  date_mc: string;
  date_mc_evalue: string;
  facture_date_facture: string;
  type_controle_libelle: string;
  numero_rapport: number;
  date_edition: string;
  numero_liasse: string;
  resultat_libelle: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  type_prochain_controle_code: string;
  controleur_nom: string;
  observation: string;
  categorie_libelle: string;
  genre_code: string;
  marque: string;
  modele: string;
  carrosserie_code: string;
  categorie_internationale_code: string;

  energie_code: string;
  puissance_fiscale: number;
  nb_place_assises: number;
  ptac: number;
  poid_a_vide: string;
  numero_liasse_multi_pv: string;
  controleur_agrement_vl: string;

  constructor(control: IControlFiche) {
    this.id = control?.id;
    this.client_id = control?.client_id;
    this.client_adresse = control?.client_adresse;
    this.client_code_client =
      control?.client_code_client != 0 ? control?.client_code_client : null;
    this.client_cp = control?.client_cp;
    this.client_email = control?.client_email;
    this.client_nom = control?.client_nom;
    this.client_suite = control?.client_suite;
    this.client_telephone = control?.client_telephone;
    this.client_ville = control?.client_ville;
    this.proprietaire_adresse = control?.proprietaire_adresse;
    this.proprietaire_cp = control?.proprietaire_cp;
    this.proprietaire_nom = control?.proprietaire_nom;
    this.proprietaire_suite = control?.proprietaire_suite;
    this.proprietaire_ville = control?.proprietaire_ville;
    this.controleur_nom = control?.controleur_nom;
    this.controleur_agrement_vl = control?.controleur_agrement_vl;
    this.apporteurNational_nom = `${
      control?.apporteurNational_code
        ? `${control?.apporteurNational_code} -`
        : ''
    }
         ${control?.apporteurNational_nom || ''} `;
    this.apporteurLocal_nom = `${
      control?.apporteurLocal_code ? `${control?.apporteurLocal_code} -` : ''
    } ${control?.apporteurLocal_nom || ''}`;

    this.facture_montant_ht = control?.facture_montant_ht
      ? `${(+control?.facture_montant_ht)?.toFixed(2)} €`
      : `0.00 €`;
    this.facture_montant_ttc = control?.facture_montant_ttc
      ? `${(+control?.facture_montant_ttc)?.toFixed(2)} €`
      : `0.00 €`;
    this.facture_solde = control?.facture_solde
      ? `${(+control?.facture_solde).toFixed(2)} €`
      : `0.00 €`;

    this.carrosserie_code = control?.carrosserie_code;
    this.categorie_libelle = control?.categorie_libelle;
    this.categorie_internationale_code = control?.categorie_internationale_code;
    this.genre_code = control?.genre_code;

    this.code_pays = control?.code_pays;
    this.date_ci = control?.date_ci
      ? moment(control?.date_ci).format('DD/MM/YYYY')
      : '';
    this.date_edition = control?.date_edition
      ? moment(control?.date_edition).format('DD/MM/YYYY')
      : '';
    this.date_mc = control?.date_mc
      ? moment(control?.date_mc).format('DD/MM/YYYY')
      : '';
    this.date_mc_evalue = control?.date_mc_evalue
      ? moment(control?.date_mc_evalue).format('DD/MM/YYYY')
      : '';
    this.date_validite_vtc = control?.date_validite_vtc
      ? moment(control?.date_validite_vtc).format('DD/MM/YYYY')
      : '';
    this.date_validite_vtp = control?.date_validite_vtp
      ? moment(control?.date_validite_vtp).format('DD/MM/YYYY')
      : '';
    this.facture_date_facture = control?.facture_date_facture;
    this.energie_code = control?.energie_code;

    this.immatriculation = control?.immatriculation;
    this.type_controle_libelle = control?.type_controle_libelle;
    this.marque = control?.marque;
    this.modele = control?.modele;

    this.nb_place_assises = control?.nb_place_assises || null;
    this.numero_bon_livraison = control?.numero_bon_livraison || 0;
    this.facture_numero_facture =
      control?.facture_numero_facture || 'Contrôle non facturé';

    this.numero_liasse = control?.numero_liasse_multi_pv
      ? Object.values(JSON.parse(control?.numero_liasse_multi_pv)).join(' - ')
      : control?.numero_liasse;

    this.numero_rapport = control?.numero_rapport;
    this.observation = control?.observation;
    this.poid_a_vide =
      Number(control?.poid_a_vide) == -1 ? 'ABSENT' : control?.poid_a_vide;
    this.ptac = control?.ptac || null;
    this.puissance_fiscale = control?.puissance_fiscale || null;
    this.resultat_libelle = control?.resultat_libelle || '';

    this.type_prochain_controle_code = control?.type_prochain_controle_code;
    this.documentPresent = `${control?.documentPresent_code} - ${control?.documentPresent_libelle_secta}`;
  }
}
