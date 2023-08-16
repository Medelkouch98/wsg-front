import { IEcart, ISimpleFacture } from '.';
import { TypeComptageEnum } from '../enums';

export interface IClotureCaisseRequest {
  id: number;
  date_debut: string;
  date_fin: string;
  fond_caisse_initial: number;
  fond_caisse_final: number;
  comptages: IComptage[];
  total_especes: number;
  total_sorties: number;
  total_cheques: number;
  total_cb: number;
  total_internet: number;
  total_virements: number;
  total_coupons: number;
  ecarts: IEcart[];
}

export interface IComptage {
  type: TypeComptageEnum;
  montant: number;

  valeur?: number;
  nombre?: number;
  banque?: string;
  nom?: string;
  numero?: number;

  //this data is read only and is needed to display associated factures in a popup
  factures?: ISimpleFacture[];
  isEditable?: boolean;
  isNew?: boolean;
}

export class Comptage implements IComptage {
  type: TypeComptageEnum;
  montant: number;

  valeur?: number;
  nombre?: number;
  banque?: string;
  nom?: string;
  numero?: number;

  factures?: ISimpleFacture[];
  isEditable?: boolean;
  isNew?: boolean;

  constructor(
    type: TypeComptageEnum,
    valeur: number = 0,
    nombre: number = 0,
    montant?: number
  ) {
    this.type = type;
    this.montant = montant;
    this.valeur = valeur;
    this.nombre = nombre;
    this.banque = '';
    this.nom = '';
    this.numero = null;
    this.factures = [];
    this.isEditable = true;
    this.isNew = true;
  }
}
export class ClotureCaisseRequest implements IClotureCaisseRequest {
  id: number;
  date_debut: string;
  date_fin: string;
  fond_caisse_initial: number;
  fond_caisse_final: number;
  comptages: IComptage[];
  total_especes: number;
  total_sorties: number;
  total_cheques: number;
  total_cb: number;
  total_internet: number;
  total_virements: number;
  total_coupons: number;
  ecarts: IEcart[];

  constructor() {
    this.id = null;
    this.date_debut = '';
    this.date_fin = '';
    this.fond_caisse_initial = 0;
    this.fond_caisse_final = 0;
    this.comptages = [
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 5, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 10, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 20, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 50, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 100, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 200, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_BILLET, 500, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 2, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 1, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.5, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.2, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.1, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.05, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.02, 0, 0),
      new Comptage(TypeComptageEnum.TYPE_ESPECE_PIECE, 0.01, 0, 0),
    ];
    this.total_especes = 0;
    this.total_sorties = 0;
    this.total_cheques = 0;
    this.total_cb = 0;
    this.total_internet = 0;
    this.total_virements = 0;
    this.total_coupons = 0;
    this.ecarts = [];
  }
}
export interface IClotureRequestResponse {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
