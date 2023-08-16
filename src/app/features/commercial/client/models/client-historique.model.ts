import { TypeHistoriqueEnum } from '../enum';

export interface IClientHistorique {
  id: number;
  controle_id: number;
  type: TypeHistoriqueEnum;
  immatriculation: string;
  date_validation: string;
  date_validite_vtp: string;
  date_validite_vtc: string;
  marque: string;
  modele: string;
  numero_serie: string;
  type_controle_id: number;
  type_prochain_controle_id: number;
  parametre_relance: number;
  relance_sur: number;
}
