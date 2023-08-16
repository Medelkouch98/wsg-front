import {
  IApporteurAffaireLocal,
  IApporteurAffaireNational,
  ICategorieInternationale,
  IClient,
  ITypeControle,
} from '@app/models';
import { IDocumentReglementaire } from './document-reglementaire.model';
import { IProprietaire } from './proprietaire.model';
import { IControleur } from '@app/models';

export interface IControlFicheResponse {
  id: number;
  immatriculation: string;
  date_edition: string;
  date_ci: string;
  date_mc: string;
  date_mc_evalue: string;
  code_pays: string;
  puissance_fiscale: number;
  nb_place_assises: number;
  ptac: number;
  poid_a_vide: number;

  type_controle: ITypeControle;
  marque: string;
  modele: string;
  client: IClient;
  facture: IFacture;
  numero_rapport: number;
  categorie_libelle: string;
  genre_code: string;
  carrosserie_code: string;
  energie_code: string;
  documentPresent: IDocumentReglementaire;
  numero_liasse_multi_pv: string;
  numero_liasse: number;
  resultat: string;
  resultat_libelle: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  type_prochain_controle: ITypeControle;
  observation: string;
  numero_bon_livraison: number;

  categorie_internationale: ICategorieInternationale;
  apporteurLocal: IApporteurAffaireLocal;
  apporteurNational: IApporteurAffaireNational;
  controleur: IControleur;
  proprietaire: IProprietaire;
}
export interface IFacture {
  numero_facture: string;
  date_facture: string;
  montant_ttc: string;
  montant_ht: string;
  solde: number;
}
