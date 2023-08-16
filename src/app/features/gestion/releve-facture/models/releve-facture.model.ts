export interface IReleveFacture {
  client_id: number;
  nom: string;
  email: string;
  cp: string;
  ville: string;
  code?: any;
  mode_reglement_id?: any;
  nb_factures: string;
  nb_controle: string;
  total_ttc: string;
  total_regle: string;
  solde: string;
  encours_depasse: string;
  facture_releve?: boolean;
  recoit_facture: boolean;
}
