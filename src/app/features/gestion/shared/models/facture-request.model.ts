import { IClient, IDetailPrestation } from '@app/models';
import { ITotalPrestation } from '../components/facturation-table/models';

export interface IFactureRequest {
  date_echeance: string;
  date_facture: string;
  observation: string;
  client: IClient;
  total_facture: ITotalPrestation;
  prestations: IDetailPrestation;
  prestations_divers: IDetailPrestation;
}
export class FactureRequest {
  date_echeance: string;
  date_facture: string;
  observation: string;
  client: IClient;
  total_facture: ITotalPrestation;
  prestations: IDetailPrestation;
  prestations_divers: IDetailPrestation;

  constructor(data: any) {
    this.date_echeance = data.dateEcheance;
    this.date_facture = data.dateFacture;
    this.observation = data.observation;
    this.client = data.client;
    this.total_facture = data.totalFacture;
    this.prestations = data.prestations;
    this.prestations_divers = data.prestations_divers;
  }
}
