export interface IReglementRequest {
  id: number;
  mode_reglement_id: number;
  montant: number;
  date_reglement: string | Date;
  reference: string;
  factures: number[];
}
