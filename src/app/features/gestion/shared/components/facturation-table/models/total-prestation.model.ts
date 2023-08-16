export interface ITotalPrestation {
  ttc: number;
  ht: number;
  tva: number;
}
export class TotalPrestation {
  ttc: number;
  ht: number;
  tva: number;

  constructor() {
    this.ttc = 0;
    this.ht = 0;
    this.tva = 0;
  }
}
