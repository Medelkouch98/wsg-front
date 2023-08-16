import { IPrestation, ITva } from '@app/models';
import { REDEVANCE_OTC } from '@app/config';
import { ITarification, Tarification } from './tarification.model';
import { isPrestaOb, TarificationHelper } from '@app/helpers';

export interface ITarificationRowTable {
  id: number;
  prestation_id: number;
  remise_euro: number;
  remise_pourcentage: number;
  codeprestation: string;
  libelleprestation: string;
  prix_ht: number;
  prix_ttc: number;
  prixttcremise: number;
}
export class TarificationRowTable implements ITarificationRowTable {
  id: number;
  prestation_id: number;
  remise_euro: number;
  remise_pourcentage: number;
  codeprestation: string;
  libelleprestation: string;
  prix_ht: number;
  prix_ttc: number;
  prixttcremise: number;

  constructor(
    prestation: IPrestation,
    tva: ITva,
    tarification: ITarification = new Tarification()
  ) {
    this.id = tarification.id;
    this.prestation_id = prestation?.id;
    this.codeprestation = prestation?.code;
    this.libelleprestation = prestation?.libelle;
    this.remise_euro = tarification.remise_euro || 0;
    this.remise_pourcentage = tarification.remise_pourcentage || 0;
    this.prix_ht = +parseFloat(prestation?.prix_ht).toFixed(2);
    this.prix_ttc = TarificationHelper.calculatePrixttc(
      prestation?.prix_ht,
      tva?.taux
    );
    this.prixttcremise = TarificationHelper.calculateTTCRemise(
      prestation,
      this.remise_euro,
      this.remise_pourcentage,
      tva
    );
    if (isPrestaOb(prestation?.code)) {
      this.prix_ht = +(this.prix_ht + REDEVANCE_OTC.prix_ht).toFixed(2);
      this.prix_ttc = +(this.prix_ttc + REDEVANCE_OTC.prix_ttc).toFixed(2);
    }
  }
}
