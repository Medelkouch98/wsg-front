export interface IOptionalDropDownDetails {
  id: number;
  libelle: string;
}

export class OptionalDropDownDetails implements IOptionalDropDownDetails {
  id: number;
  libelle: string;

  constructor(id: number, libelle: string) {
    this.id = id;
    this.libelle = libelle;
  }
}
