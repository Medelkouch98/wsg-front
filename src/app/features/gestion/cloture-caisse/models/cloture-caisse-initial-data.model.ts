import { TypePersonneEnum } from '@app/enums';
import { TypeComptageEnum } from '../enums';

export interface IClotureCaisseInitialData {
  fond_caisse_initial: number;
  controles_non_factures: IControleNonFacture[];
  reglements_summary: IInitialReglementSummary[];
}
export class ClotureCaisseInitialData implements IClotureCaisseInitialData {
  fond_caisse_initial: number;
  controles_non_factures: IControleNonFacture[];
  reglements_summary: IInitialReglementSummary[];

  constructor() {
    this.fond_caisse_initial = 0;
    this.controles_non_factures = [];
    this.reglements_summary = [];
  }
}
export interface IControleNonFacture {
  controle_id: number;
  nom_client: string;
  type_client: TypePersonneEnum;
  numero_rapport: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
}
export interface IInitialReglementSummary {
  type_comptage: TypeComptageEnum;
  total_factures: number;
  count_factures: number;
  factures: ISimpleFacture[];
  reglements: ISimpleReglement[];
}
export interface ISimpleFacture {
  id: number
  numero_facture: string
}

export interface ISimpleReglement {
  id: number
  montant_regle: number
}
