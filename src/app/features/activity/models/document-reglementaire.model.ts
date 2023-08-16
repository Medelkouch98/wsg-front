export interface IDocumentReglementaire {
  id: number;
  code: string;
  motif: string;
  libelle_impression_pv: string;
  libelle_secta: string;
  date_debut: string;
  date_fin: string;
  timbre_barre: boolean;
  saisie_utilisateur: boolean;
  saisissable_avec_ci_present: boolean;
  order: number;
}
