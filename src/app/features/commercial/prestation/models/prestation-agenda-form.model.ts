import { IPrestationAgendaFormDetails } from './prestation-agenda-form-details.model';

export interface IPrestationAgendaForm {
  bo_name: string;
  fo_name: string;
  fo_description: string;
  bo_description: string;
  color: string;
  price: string;
  display_price: string;
  display_duration: string;
  enabled: string;
  visible: string;
  assurance_web: string;
  duration: number;
  agendas: IPrestationAgendaFormDetails[];
  categories: IPrestationAgendaFormDetails[];
}
