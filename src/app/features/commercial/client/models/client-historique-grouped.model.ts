import { IClientHistorique } from './client-historique.model';
import { IHistorique } from './historique.model';
import { ITypeControle } from '@app/models';

export interface IClientHistoriqueGrouped {
  immatriculation: string;
  marque: string;
  modele: string;
  numero_serie: string;
  historiques?: IHistorique[];
}

export class ClientHistoriqueGrouped implements IClientHistoriqueGrouped {
  immatriculation: string;
  marque: string;
  modele: string;
  numero_serie: string;
  historiques: IHistorique[];

  constructor(data: IClientHistorique, typesControle: ITypeControle[]) {
    this.immatriculation = data.immatriculation;
    this.marque = data.marque;
    this.modele = data.modele;
    this.numero_serie = data.numero_serie;
    this.addHistorique(data, typesControle);
  }

  addHistorique(data: IClientHistorique, typesControle: ITypeControle[]) {
    const element = {
      id: data.id,
      controle_id: data.controle_id,
      type: data.type,
      date_validation: data.date_validation,
      date_validite_vtc: data.date_validite_vtc,
      date_validite_vtp: data.date_validite_vtp,
      type_controle_libelle:
        typesControle.find((type) => type.id === data?.type_controle_id)
          ?.libelle || '',
      type_prochain_controle_libelle:
        typesControle.find(
          (type) => type.id === data?.type_prochain_controle_id
        )?.libelle || '',
      parametre_relance: data.parametre_relance,
      relance_sur: data.relance_sur,
    };
    if (this.historiques?.length > 0) {
      this.historiques.push(element);
      this.historiques.sort((a, b) => {
        return a.id > b.id ? -1 : 1;
      });
    } else {
      this.historiques = [element];
    }
  }
}
