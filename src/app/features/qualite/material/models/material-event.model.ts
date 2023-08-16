import { IMaterialEventFichier } from './material-event-fichier.model';

export interface IMaterialEvent {
  id?: number;
  materiel_id?: number;
  materiel_evenement_type_id: number;
  materiel_evenement_fichiers?: IMaterialEventFichier[];
  date: string;
  observation?: string;
}
