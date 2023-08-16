import { TypeHistoriqueEnum } from '../enum';

export interface IHistorique {
  id: number;
  type: TypeHistoriqueEnum;
  date_validite_vtp: string;
  date_validite_vtc: string;
  date_validation?: string;
  type_controle_libelle: string;
  type_prochain_controle_libelle: string;
  relance_sur: number;
  parametre_relance: number;
}
