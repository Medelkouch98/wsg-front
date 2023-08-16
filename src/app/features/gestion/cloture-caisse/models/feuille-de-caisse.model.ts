import { TypePersonneEnum } from '@app/enums';
import { TypeComptageEnum } from '../enums';

export interface IFeuilleDeCaisse {
  id: number;
  date_debut: string;
  date_fin: string;
  realise_par: string;
  fond_caisse_initial: number;
  fond_caisse_final: number;
  total_sorties: number;
  activite_factures: IActiviteFactures;
  detail_factures: IDetailFacture[];
  activite_non_factures: IActiviteNonFactures;
  detail_non_factures: IDetailNonFacture[];
  ecarts: IEcart[];
  sorties_caisse: ISortieCaisse[];
  factures_regles: IFactureRegle[];
  factures_non_regles: IFactureNonRegle[];
  reglements_summary: IReglementSummary[];
}

export interface IEcart {
  type: TypeComptageEnum;
  montant: number;
  commentaire: string;
}
export class Ecart implements IEcart {
  type: TypeComptageEnum;
  montant: number;
  commentaire: string;
  constructor(type: TypeComptageEnum) {
    this.type = type;
    this.montant = 0;
    this.commentaire = '';
  }
}

export interface IReglementSummary {
  type_comptage: TypeComptageEnum;
  total: number;
  total_factures_passage: number;
  total_factures_pro: number;
}

export interface IFactureRegle {
  type_client: number;
  nom_client: string;
  numero_facture: string;
  date_facture: string;
  montant_ttc: number;
  type_reglement: string;
  reference_reglement?: string;
  date_reglement: string;
  montant_regle: number;
  montant_restant: number;
}

export interface IFactureNonRegle {
  nom_client: string;
  numero_facture: string;
  montant_ttc: number;
  type_reglement: string;
  reference_reglement: string;
  date_reglement: Date;
  montant_regle: number;
  montant_restant: number;
}

export interface ISortieCaisse {
  usage: string;
  montant: number;
}

export interface IDetailNonFacture {
  nom_client: string;
  numero_rapport: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
}

export interface IActiviteFactures {
  factures_clients_passage: IFacturesClient[];
  factures_clients_pro: IFacturesClient[];
  total_ht_otc: number;
  total_tva_otc: number;
  total_ttc_otc: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
}

export interface IFacturesClient {
  date_facture: string;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
}

export interface IDetailFacture {
  type_client: TypePersonneEnum;
  nom_client: string;
  numero_facture: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  type_reglement?: string;
  montant_reglement: number;
  observation?: string;
}

export interface IActiviteNonFactures {
  total_ht: number;
  total_tva: number;
  total_ttc: number;
}
