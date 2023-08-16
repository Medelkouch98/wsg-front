import { IFacture } from '@app/models';
import {TypePersonneEnum} from "@app/enums";

export interface IReglement {
  id: number;
  date_reglement: Date;
  montant: number;
  reference: any;
  client_id: number;
  client_nom: string;
  client_type: TypePersonneEnum;
  mode_reglement_id: number;
  numero_cloture_caisse: number;
  created_at: string;
  updated_at: string;
  websur_controle_id: any;
  factures: IFacture[];
}
export class Reglement implements IReglement {
  id: number;
  date_reglement: Date;
  montant: number;
  reference: any;
  client_id: number;
  client_nom: string;
  client_type: TypePersonneEnum;
  mode_reglement_id: number;
  numero_cloture_caisse: number;
  created_at: string;
  updated_at: string;
  websur_controle_id: any;
  factures: IFacture[];
  constructor() {
    this.id = null;
    this.date_reglement = new Date();
    this.montant = null;
    this.reference = null;
    this.client_id = null;
    this.client_nom = null;
    this.client_type=null;
    this.mode_reglement_id = null;
    this.numero_cloture_caisse = null;
    this.created_at = null;
    this.updated_at = null;
    this.websur_controle_id = null;
    this.factures = null;
  }
}
