export interface IProprietaire {
  id?: number;
  nom: string;
  adresse: string;
  suite: string;
  cp: string;
  ville: string;
  telephone?: string;
  email?: string;
  civilite_id?: number;
  id_wsc?: number;
}
