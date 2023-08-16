import { ITotalPrestation, TotalPrestation } from './total-prestation.model';
import { ITotalOtc, TotalOtc } from './total-otc.model';

export interface ITotalFacture {
  totalPrestation: ITotalPrestation;
  totalOtc: ITotalOtc;
  htPrestation: number;
}
export class TotalFacture {
  totalPrestation: ITotalPrestation;
  totalOtc: ITotalOtc;
  htPrestation: number;

  constructor(
    totalPrestation: ITotalPrestation = new TotalPrestation(),
    totalOtc: ITotalOtc = new TotalOtc(),
    htPrestation: number = 0
  ) {
    this.totalPrestation = totalPrestation;
    this.totalOtc = totalOtc;
    this.htPrestation = htPrestation;
  }
}
