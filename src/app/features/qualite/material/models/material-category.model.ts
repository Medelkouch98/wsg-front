import { IMaterialDisplayType } from './material-type.model';

export interface IMaterialCategory {
  id: number;
  libelle: string;
  columns: string[];
}

export interface IMaterialDisplayCategory {
  id: number;
  libelle: string;
  columns: string[];
  has_error: boolean;
  types: IMaterialDisplayType[];
}

export const CONNECTED_MATERIAL_CATEGORY_ID = 1;
export const NON_CONNECTED_MATERIAL_CATEGORY_ID = 2;
export const SAFETY_VISITS_CATEGORY_ID = 3;

export const MATERIAL_CATEGORIES: IMaterialCategory[] = [
  {
    id: CONNECTED_MATERIAL_CATEGORY_ID,
    libelle: 'connectedMaterials',
    columns: ['has_error', 'numero_serie', 'marque', 'modele'],
  },
  {
    id: NON_CONNECTED_MATERIAL_CATEGORY_ID,
    libelle: 'nonConnectedMaterials',
    columns: [
      'has_error',
      'numero_serie',
      'marque',
      'modele',
      'numero_certificat_otclan',
      'numero_certificat_qualification',
      'banc_version_specification',
    ],
  },
  {
    id: SAFETY_VISITS_CATEGORY_ID,
    libelle: 'safetyVisits',
    columns: ['has_error', 'marque', 'modele'],
  },
];
