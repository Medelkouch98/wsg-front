export interface ICentre {
  id: number;
  role_id: number;
  agrement: string;
  numero_affaire: number;
  raison_sociale: string;
  ville: string;
  actif: number;
  typecentre: number;
  type_libelle: string;
  urlagenda: string;
  adresse: string;
  cp: string;
  logo: string;
}

export class Centre implements ICentre {
  id: number;
  role_id: number;
  agrement: string;
  numero_affaire: number;
  raison_sociale: string;
  ville: string;
  actif: number;
  typecentre: number;
  urlagenda: string;
  adresse: string;
  cp: string;
  type_libelle: string;
  logo: string;

  constructor(id: number, agrement: string) {
    this.id = id;
    this.agrement = agrement;
  }
}
