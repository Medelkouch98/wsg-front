import { TypeApporteurAffaire } from '@app/config';

export interface IApporteurAffaireIdentification {
  id: number;
  nom: string;
  adresse: string;
  suite: string;
  cp: string;
  ville: string;
  fixe: string;
  email: string;
  civilite_id: number;
  code: number;
  fax: string;
  mobile: string;
  actif: boolean;
  type: TypeApporteurAffaire;
}
