export interface IPrestationsSearchRequestForm {
  actif: number;
  code: string;
  libelle: string;
  soumis_redevance: number;
}

export class PrestationsSearchRequestForm
  implements IPrestationsSearchRequestForm
{
  actif: number;
  code: string;
  libelle: string;
  soumis_redevance: number;
  constructor() {
    this.actif = 1;
    this.code = '';
    this.libelle = '';
    this.soumis_redevance = -1;
  }
}
