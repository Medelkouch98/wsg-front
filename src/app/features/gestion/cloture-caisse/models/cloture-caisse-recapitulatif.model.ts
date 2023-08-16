import { TypeComptageEnum } from '../enums';

export interface IClotureCaisseRecapitulatif {
  mode_reglement: TypeComptageEnum;
  fond_de_caisse: number;
  sortie_de_caisse: number;
  total_compte: number;
  total_a_controller: number;
  total_factures_reglees: number;
  difference: number;
  nb_factures: number;
  commentaire: string;
}
