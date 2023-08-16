export interface ITarificationPrice {
  id?: number;
  prestation_id: number;
  remise_euro: number;
  remise_pourcentage: number;
  nom?: string;
  prixRemiseHT: number;
  prixRemiseTTC: number;
}
