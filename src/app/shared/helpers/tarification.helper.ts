import { IPrestation, ITva } from '@app/models';
import { REDEVANCE_OTC } from '@app/config';
import {
  roundNumberTreeDecimals,
  roundNumberTwoDecimals,
} from './global.helper';

/**
 * Vérifier si la prestation est OB
 * @param code string
 * @return boolean
 */
export const isPrestaOb = (code: string): boolean => {
  return code?.substring(0, 2).toLowerCase() == 'ob';
};

/**
 * Calculer le montant_tcc, le montant_ht_net, montant_tva à partir de montant_ht_brut
 * @param {number} montant_ht_brut
 * @param {number} taux_tva
 * @param {number} remise_euro
 * @param {number} remise_pourcentage
 */
export const calculatePricesOfPrestation = (
  montant_ht_brut: number,
  taux_tva: number,
  remise_euro: number,
  remise_pourcentage: number
) => {
  let ttcBase = montant_ht_brut * (1 + taux_tva / 100);
  let montant_ttc = ttcBase;
  if (remise_euro > 0) {
    montant_ttc = ttcBase - remise_euro;
  } else if (remise_pourcentage > 0) {
    montant_ttc = ttcBase - (ttcBase * remise_pourcentage) / 100;
  }
  let montant_ht_net = roundNumberTreeDecimals(
    montant_ttc / (1 + taux_tva / 100)
  );
  let montant_tva = roundNumberTwoDecimals(montant_ttc - montant_ht_net);
  return {
    montant_ht_net,
    montant_tva,
    montant_ttc,
  };
};

export class TarificationHelper {
  /**
   * Calculer le prix remise ttc
   * @param prestation IPrestation
   * @param remise_euro number
   * @param remise_pourcentage number
   * @param tva ITva
   * @return number
   */
  static calculateTTCRemise(
    prestation: IPrestation,
    remise_euro: number,
    remise_pourcentage: number,
    tva: ITva
  ): number {
    const prixTtc = +(
      parseFloat(prestation?.prix_ht) *
      (1 + parseFloat(tva?.taux) / 100)
    ).toFixed(2);
    let prixRemiseTtc = prixTtc;
    if (remise_euro > 0) {
      prixRemiseTtc = +(prixTtc - remise_euro).toFixed(2);
    } else if (remise_pourcentage > 0) {
      prixRemiseTtc = prixTtc * (1 - remise_pourcentage / 100);
    }
    return isPrestaOb(prestation?.code)
      ? +(prixRemiseTtc + REDEVANCE_OTC.prix_ttc).toFixed(2)
      : +prixRemiseTtc.toFixed(2);
  }

  /**
   * Calculer le prix remise HT
   * @param prestation IPrestation
   * @param remise_euro number
   * @param remise_pourcentage number
   * @return number
   */
  static calculateHTRemise(
    prestation: IPrestation,
    remise_euro: number,
    remise_pourcentage: number
  ): number {
    let prixRemiseHT = +prestation?.prix_ht;
    if (remise_euro > 0) {
      prixRemiseHT = +(+prestation?.prix_ht - remise_euro).toFixed(2);
    } else if (remise_pourcentage > 0) {
      prixRemiseHT = +prestation?.prix_ht * (1 - remise_pourcentage / 100);
    }
    return isPrestaOb(prestation?.code)
      ? +(prixRemiseHT + REDEVANCE_OTC.prix_ttc).toFixed(2)
      : +prixRemiseHT.toFixed(2);
  }
  /**
   * Calculer le prix ttc
   * @param prixht string
   * @param tauxTva string
   * @return number
   */
  static calculatePrixttc(prixht: string, tauxTva: string): number {
    return +(+prixht * (1 + +tauxTva / 100)).toFixed(2);
  }
}
