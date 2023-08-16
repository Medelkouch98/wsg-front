import { ICompteurAddActionRequest } from './compteurs-action-add.model';
import { ICompteurItem } from './compteurs-search-response.model';
import { Observable } from 'rxjs';
import { IJustificationsResponse } from './justifications-response.model';

export interface IJustifieForAllRequest {
  justification_id: number;
  justification_libelle: string;
  actions: ICompteurAddActionRequest[];
  fichiers: Blob[];
}

export interface IJustifieForAllData {
  addRequest: IJustifieForAllRequest;
  codeCompteur: string;
}

export interface ICompteursAddJustificationDialogData {
  compteur: ICompteurItem;
  justifications$: Observable<IJustificationsResponse[]>;
}
