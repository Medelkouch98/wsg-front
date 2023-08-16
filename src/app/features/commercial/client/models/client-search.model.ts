export interface IClientSearch {
  type: string;
  nom: string;
  ville: string;
  code: string;
  cp: string;
  actif: number;
  // dans le cas de recherche avec tri et pagination
  sort?: string;
  order?: string;
  per_page?: number;
  page?: number;
}
export class ClientSearch implements IClientSearch {
  type: string;
  nom: string;
  ville: string;
  code: string;
  cp: string;
  actif: number;
  // dans le cas de recherche avec tri et pagination
  sort?: string;
  order?: string;
  per_page?: number;
  page?: number;
  constructor() {
    this.type = '';
    this.nom = '';
    this.ville = '';
    this.code = '';
    this.cp = '';
    this.actif = 1;
  }
}
