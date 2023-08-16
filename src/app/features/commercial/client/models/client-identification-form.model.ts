import { IClientPro } from '@app/models';
import { TypePersonneEnum } from '@app/enums';

export interface IIdentificationForm {
  type: TypePersonneEnum;
  civilite_id: number;
  nom: string;
  adresse: string;
  suite: string;
  cp: string;
  ville: string;
  fixe: string;
  email: string;
  mobile: string;
  actif: boolean;
  clientPro: IClientPro;
}
