import { IMaterial } from './material.model';
import { IMaterialCharacteristic } from './material-characteristic.model';
import { IMaterialSubTypeEventType } from './material-sub-type-event-type.model';

export interface IMaterialSubType {
  id: number;
  libelle: string;
  materiel_type_id: number;
  materiel_categorie_id: number;
  materiel_caracteristiques: IMaterialCharacteristic[];
  materiel_evenement_types: IMaterialSubTypeEventType[];
}

export interface IMaterialDisplaySubType {
  id: number;
  libelle: string;
  materiel_categorie_id: number;
  materiel_caracteristiques: IMaterialCharacteristic[];
  materiel_evenement_types: IMaterialSubTypeEventType[];
  materials: IMaterial[];
}

export interface SubTypesByType {
  subTypes: IMaterialSubType[];
  id: number;
  libelle: string;
}
