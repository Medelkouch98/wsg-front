import { ITva } from './tva.model';

export interface IPrestation {
  id: number;
  libelle: string;
  code: string;
  numero_comptable: string;
  actif: boolean;
  prix_ht: string;
  prestation_divers?: boolean;
  prestation_agenda_id?: number;
  soumis_redevance: boolean;
  duree?: number;
  tva_id: number;
  readonly tva?: ITva;
  readonly ttc?: number;
}
