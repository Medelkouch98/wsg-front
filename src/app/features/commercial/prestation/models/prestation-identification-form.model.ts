import { IPrestationAgendaForm } from './prestation-agenda-form.model';

export interface IPrestationIdentificationForm {
  id: number;
  libelle: string;
  code: string;
  numero_comptable: string;
  actif: boolean;
  prix_ht: string;
  prix_ttc?: string;
  prestation_divers: boolean;
  prestation_agenda_id: number;
  soumis_redevance: boolean;
  duree: number;
  tva_id: number;
  agenda: IPrestationAgendaForm;
  familles: number[];
}
export class PrestationIdentificationForm
  implements IPrestationIdentificationForm
{
  actif: boolean;
  agenda: IPrestationAgendaForm;
  code: string;
  duree: number;
  id: number;
  libelle: string;
  numero_comptable: string;
  prestation_agenda_id: number;
  prestation_divers: boolean;
  prix_ht: string;
  prix_ttc: string;
  soumis_redevance: boolean;
  tva_id: number;
  familles: number[];

  constructor() {
    this.actif = true;
    this.agenda = null;
    this.code = null;
    this.duree = null;
    this.id = null;
    this.libelle = null;
    this.numero_comptable = null;
    this.prestation_agenda_id = null;
    this.prestation_divers = null;
    this.prix_ht = null;
    this.prix_ttc = null;
    this.soumis_redevance = false;
    this.tva_id = null;
    this.familles = [];
  }
}
