import { ClientPro, IClientPro } from '@app/models';
import { TypePersonneEnum } from '@app/enums';

export interface IClient {
  id?: number;
  civilite_id?: number;
  type: TypePersonneEnum;
  nom: string;
  adresse: string;
  suite?: string;
  cp: string;
  ville: string;
  fixe?: string;
  email?: string;
  centres?: number[];
  date_derniere_prestation?: string;
  mobile?: string;
  actif: boolean;
  clientPro?: IClientPro;
  code_client?: number;
}

export class Client implements IClient {
  id?: number;
  civilite_id?: number;
  type: TypePersonneEnum;
  nom: string;
  adresse: string;
  suite?: string;
  cp: string;
  ville: string;
  fixe?: string;
  email?: string;
  centres?: number[];
  date_derniere_prestation?: string;
  mobile?: string;
  actif: boolean;
  clientPro?: IClientPro;
  code_client?: number;

  constructor() {
    this.id = null;
    this.civilite_id = null;
    this.type = TypePersonneEnum.COMPTE;
    this.nom = '';
    this.adresse = '';
    this.suite = '';
    this.cp = null;
    this.ville = '';
    this.fixe = '';
    this.email = '';
    this.centres = [];
    this.mobile = null;
    this.actif = true;
    this.clientPro = new ClientPro();
  }
}
