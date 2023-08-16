export interface ITarification {
  id?: number;
  prestation_id: number;
  remise_euro: number;
  remise_pourcentage: number;
}

export class Tarification implements ITarification {
  id?: number;
  prestation_id: number;
  remise_euro: number;
  remise_pourcentage: number;

  constructor(data: ITarification = null) {
    this.id = data?.id || null;
    this.prestation_id = data?.prestation_id || null;
    this.remise_euro = data?.remise_euro || 0;
    this.remise_pourcentage = data?.remise_pourcentage || 0;
  }
}
