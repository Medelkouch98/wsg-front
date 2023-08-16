import { IDailyActivityFacture } from '.';

export interface IDailyActivityEvent {
  controle_id: number;
  code_type_controle: string;
  immatriculation: string;
  agrement_controleur: string;
  nom_controleur: string;
  date_debut: string;
  date_fin: string;
  code_client: any;
  marque_ci: string;
  nom_client: string;
  email: string;
  telephone: string;
  facture: IDailyActivityFacture;
}
