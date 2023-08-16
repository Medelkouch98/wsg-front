import { IApporteurAffaire, IClient } from '@app/models';
import { FactureStatusEnum, FactureTypeEnum } from '../../enums';

export interface IFactureSearchForm {
  start_date: string;
  end_date: string;
  facture_type: FactureTypeEnum;
  montant_ttc: number;
  numero_facture: string;
  type_reglement: number;
  immatriculation: string;
  negocie_en: number;
  client_denomination: string;
  client_id: number;
  mandant: string;
  client?: IClient;
  apporteurAffaire?: IApporteurAffaire;
  facture_status: FactureStatusEnum;
}
export class FactureSearchForm implements IFactureSearchForm {
  start_date: string;
  end_date: string;
  facture_type: FactureTypeEnum;
  montant_ttc: number;
  numero_facture: string;
  type_reglement: number;
  immatriculation: string;
  negocie_en: number;
  client_denomination: string;
  client_id: number;
  mandant: string;
  client?: IClient;
  apporteurAffaire?: IApporteurAffaire;
  facture_status: FactureStatusEnum;

  constructor() {
    this.start_date = '';
    this.end_date = '';
    this.facture_type = FactureTypeEnum.all;
    this.montant_ttc = null;
    this.numero_facture = '';
    this.type_reglement = null;
    this.immatriculation = '';
    this.negocie_en = null;
    this.client_denomination = '';
    this.client_id = null;
    this.mandant = '';
    this.client = null;
    this.apporteurAffaire = null;
    this.facture_status = FactureStatusEnum.all;
  }
}
