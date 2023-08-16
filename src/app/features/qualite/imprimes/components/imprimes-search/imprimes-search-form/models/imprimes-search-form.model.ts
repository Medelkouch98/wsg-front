import { EtatCartonLiasseEnum, EtatImprimesEnum } from '../../../../enum';

export interface IImprimesSearchForm {
  numero_liasse: number;
  mois: number;
  annee: number;
  carton_ferme: EtatCartonLiasseEnum;
  etat: EtatImprimesEnum;
}

export class ImprimesSearchForm implements IImprimesSearchForm {
  numero_liasse: number;
  mois: number;
  annee: number;
  carton_ferme: EtatCartonLiasseEnum;
  etat: EtatImprimesEnum;

  constructor() {
    this.numero_liasse = null;
    this.mois = -1;
    this.annee = -1;
    this.carton_ferme = EtatCartonLiasseEnum.open;
    this.etat = EtatImprimesEnum.all;
  }
}
