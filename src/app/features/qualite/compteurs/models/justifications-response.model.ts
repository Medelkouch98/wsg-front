export interface IJustificationsResponse {
  id: number;
  libelle: string;
  compteur_actions: ICompteurActionResponse[];
}

export interface ICompteurActionResponse {
  id: number;
  libelle: string;
  type: TypeCompteurAction;
}

export enum TypeCompteurAction {
  PREVENTIVE = 'Action Préventive',
  CORRECTIVE = 'Action Corrective',
}
