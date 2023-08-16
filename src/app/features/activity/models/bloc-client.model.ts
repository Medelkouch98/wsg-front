export interface IBlocClient {
  numero_bon_livraison: number;
  facture_numero_facture: string;
  client_code_client: string;
  client_nom: string;
  client_adresse: string;
  client_suite: string;
  client_cp: string;
  client_ville: string;
  client_email: string;
  client_telephone: string;
  apporteurLocal_nom: string;
  apporteurNational_nom: string;
  facture_montant_ttc: string;
  facture_montant_ht: string;
  facture_solde: string;
}

export class BlocClient implements IBlocClient {
  numero_bon_livraison: number;
  facture_numero_facture: string;
  client_code_client: string;
  client_nom: string;
  client_adresse: string;
  client_suite: string;
  client_cp: string;
  client_ville: string;
  client_email: string;
  client_telephone: string;
  apporteurLocal_nom: string;
  apporteurNational_nom: string;
  facture_montant_ttc: string;
  facture_montant_ht: string;
  facture_solde: string;

  constructor() {
    this.numero_bon_livraison = null;
    this.facture_numero_facture = '';
    this.client_code_client = '';
    this.client_nom = '';
    this.client_adresse = '';
    this.client_suite = '';
    this.client_cp = '';
    this.client_ville = '';
    this.client_email = '';
    this.client_telephone = '';
    this.apporteurLocal_nom = '';
    this.apporteurNational_nom = '';
    this.facture_montant_ttc = '';
    this.facture_montant_ht = '';
    this.facture_solde = null;
  }
}
