import * as moment from 'moment';
import { IClient } from '@app/models';

export interface IAdvancedSearchForm {
  debut_periode: string;
  fin_periode: string;
  numero_dossier: number;
  numero_liasse_multi_pv: number;
  numero_liasse: number;
  numero_facture: string;
  nom_controleur: string;
  type_controle_id: string;
  categorie_id: string;
  immatriculation: string;
  numero_serie: string;
  marque: string;
  modele: string;
  energie_id: string;
  client_id: number;
  nom_client: string;
  nom_proprietaire: string;
  mode_reglement_id: string;

  client?: IClient;
  proprietaire?: IClient;
}

export class AdvancedSearchForm implements IAdvancedSearchForm {
  categorie_id: string;
  nom_client: string;
  client_id: number;
  nom_controleur: string;
  fin_periode: string;
  energie_id: string;
  numero_facture: string;
  immatriculation: string;
  numero_liasse: number;
  marque: string;
  modele: string;
  numero_dossier: number;
  nom_proprietaire: string;
  numero_liasse_multi_pv: number;
  mode_reglement_id: string;
  numero_serie: string;
  debut_periode: string;
  type_controle_id: string;

  client?: IClient;
  proprietaire?: IClient;

  constructor() {
    this.debut_periode = moment(new Date()).format('YYYY-MM-DD');
    this.fin_periode = moment(new Date()).format('YYYY-MM-DD');
    this.numero_dossier = null;
    this.numero_liasse_multi_pv = null;
    this.numero_liasse = null;
    this.numero_facture = null;
    this.nom_controleur = null;
    this.type_controle_id = null;
    this.categorie_id = null;
    this.immatriculation = null;
    this.numero_serie = null;
    this.marque = null;
    this.modele = null;
    this.energie_id = null;
    this.client_id = null;
    this.nom_client = '';
    this.nom_proprietaire = '';
    this.mode_reglement_id = null;
    this.client = null;
    this.proprietaire = null;
  }
}
