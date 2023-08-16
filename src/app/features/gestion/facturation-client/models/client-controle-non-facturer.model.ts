export interface IClientControleNonFactures {
  id: number;
  date_premier_controle: string;
  date_dernier_controle: string;
  total_ttc: number;
  nom: string;
  nb_controles: number;
  email: boolean;
  code: string;
  cp: string;
  ville: string;
  multi_pv: boolean;
  controles: IControle[];
}
export interface IControle {
  id: number;
  immatriculation: string;
  date_edition: string;
  proprietaire: string;
  prestations: IControlePrestation[];
}
export interface IControlePrestation {
  code: string;
  libelle: string;
  montant_ttc: string;
}
