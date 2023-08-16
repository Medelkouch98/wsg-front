export interface ICalledRessources {
  modesReglements: boolean;
  typesControles: boolean;
  categories: boolean;
  energies: boolean;
  civilites: boolean;
  prestations: boolean;
  echeances: boolean;
  marques: boolean;
  tvas: boolean;
  famillesIT: boolean;
  roles: boolean;
  calledAll: boolean;
}

export class CalledRessources implements ICalledRessources {
  modesReglements: boolean;
  typesControles: boolean;
  categories: boolean;
  energies: boolean;
  civilites: boolean;
  prestations: boolean;
  echeances: boolean;
  marques: boolean;
  tvas: boolean;
  famillesIT: boolean;
  roles: boolean;
  calledAll: boolean;

  constructor() {
    this.typesControles = false;
    this.marques = false;
    this.energies = false;
    this.civilites = false;
    this.modesReglements = false;
    this.prestations = false;
    this.echeances = false;
    this.categories = false;
    this.tvas = false;
    this.famillesIT = false;
    this.roles = false;
    this.calledAll = false;
  }
}
