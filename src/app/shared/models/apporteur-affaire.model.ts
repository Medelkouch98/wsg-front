import { TypeApporteurAffaire } from '@app/config';

export interface IApporteurAffaire {
  id: number;
  code: number;
  nom: string;
  actif: boolean;
  type: TypeApporteurAffaire;
}
