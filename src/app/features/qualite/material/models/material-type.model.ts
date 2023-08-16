import { IMaterialDisplaySubType } from './material-sub-type.model';

export interface IMaterialType {
  id: number;
  libelle: string;
}

export interface IMaterialDisplayType {
  id: number;
  libelle: string;
  icon: string;
  has_error: boolean;
  subTypes: IMaterialDisplaySubType[];
}
