import { IMaterialEvent } from './material-event.model';
import { IMaterialCharacteristic } from './material-characteristic.model';

export interface IMaterial {
  id?: number;
  materiel_type_id?: number;
  materiel_sous_type_id: number;
  materiel_categorie_id?: number;
  materiel_societe_maintenance_id: number;
  numero_certificat_qualification?: string;
  numero_certificat_otclan?: string;
  banc_version_specification?: string;
  has_error?: boolean;
  marque: string;
  modele: string;
  actif?: boolean;
  numero_serie: string;
  code_otclan?: string;
  materiel_evenements?: IMaterialEvent[];
  materiel_caracteristiques?: IMaterialCharacteristic[];
}
