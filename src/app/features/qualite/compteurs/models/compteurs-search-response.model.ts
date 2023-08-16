export interface ICompteursSearchResponse {
  compteurs: ICompteurItem[];
  stats: ICompteursStats;
  integrated: number;
}

export interface ICompteurItem {
  id: number;
  code: string;
  libelle: string;
  niveau: number;
  agrement_controleur: string;
  immatriculation: string;
  date_controle: string;
  justification: string;
  date_integration?: any;
  controle_id: number;
  justification_id?: any;
  numero_rapport: number;
  controleur_nom: string;
  actions: ICompteurItemAction[];
  fichiers: IAttachment[];
}

export interface ICompteurItemAction {
  id: number;
  type_action: string;
  libelle: string;
  compteur_exception_id: number;
  is_custom?: any;
  created_at?: Date;
  fichier_chemin?: any;
  fichier_created_at?: any;
}

export interface ICompteursStats {
  niveau1: ICompteursStatsDetails;
  niveau2: ICompteursStatsDetails;
  niveau3: ICompteursStatsDetails;
  global: ICompteursStatsDetails;
}

export interface ICompteursStatsDetails {
  justified: number;
  unjustified: number;
  total: number;
}

export interface IAttachment {
  id: number;
  extension: string;
  fichier: string;
  chemin: string;
  compteur_exception_id: number;
  created_at: Date;
  updated_at: Date;
}
