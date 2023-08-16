import { Observable } from 'rxjs/internal/Observable';
import { IJustificationsResponse } from './justifications-response.model';

export interface ICompteurAddActionRequest {
  action_corrective_id: number;
  action_corrective_libelle: string;
  action_preventive_id: number;
  action_preventive_libelle: string;
}

export class CompteurAddActionRequest implements ICompteurAddActionRequest {
  action_corrective_id: number;
  action_corrective_libelle: string;
  action_preventive_id: number;
  action_preventive_libelle: string;

  constructor(
    action_corrective_id: number,
    action_corrective_libelle: string,
    action_preventive_id: number,
    action_preventive_libelle: string
  ) {
    this.action_corrective_id = action_corrective_id;
    this.action_corrective_libelle = action_corrective_libelle;
    this.action_preventive_id = action_preventive_id;
    this.action_preventive_libelle = action_preventive_libelle;
  }
}

export interface ICompteurAddActionData {
  compteurId: number;
  addActionRequest: ICompteurAddActionRequest;
}

export interface ICompteurAddActionDialogData {
  compteurId: number;
  justifications$: Observable<IJustificationsResponse[]>;
}
