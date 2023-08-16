export interface IRedevanceOTC {
  libelle: string;
  code: string;
  prix_ttc: number;
  prix_ht: number;
  taux_tva?: number;
  prix_ttc_remise: number;
}

export class RedevanceOTC implements IRedevanceOTC {
  libelle: string;
  code: string;
  prix_ttc: number;
  prix_ht: number;
  taux_tva?: number;
  prix_ttc_remise: number;

  constructor(
    libelle: string,
    code: string,
    prix_ttc: number,
    prix_ht: number,
    taux_tva: number,
    prix_ttc_remise: number
  ) {
    this.libelle = libelle;
    this.code = code;
    this.prix_ttc = prix_ttc;
    this.prix_ht = prix_ht;
    this.taux_tva = taux_tva;
    this.prix_ttc_remise = prix_ttc_remise;
  }
}
