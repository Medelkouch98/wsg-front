import {ExportTypeEnum, TypePersonneEnum} from '@app/enums';
import { ExportEtatEnum } from '../../features/gestion/exports/enums/export-etat.enum';

export interface IExportEtatRequest {
  date_debut: string;
  date_fin: string;
  type_etat: ExportEtatEnum;
  file_type: ExportTypeEnum;

  //optional
  id_client?: number;
  nom_client?: string;
  code_client?: number;
  type_client?: TypePersonneEnum;
  numero_facture?: string;
  libelle_prestation?: string;
  code_partenaire?: string;
  nom_partenaire?: string;
  numero_rapport?: string;
  numero_mandat?: string;
  nom_mandat?: string;
}

export class ExportEtatRequest implements IExportEtatRequest {
  date_debut: string;
  date_fin: string;
  type_etat: ExportEtatEnum;
  file_type: ExportTypeEnum;
  //optional
  id_client?: number;
  nom_client?: string;
  code_client?: number;
  type_client?: TypePersonneEnum;
  numero_facture?: string;
  libelle_prestation?: string;
  code_partenaire?: string;
  nom_partenaire?: string;
  numero_rapport?: string;
  numero_mandat?: string;
  nom_mandat?: string;

  constructor() {
    this.date_debut = null;
    this.date_fin = null;
    this.type_etat = null;
    this.file_type = ExportTypeEnum.pdf;
    this.id_client = null;
    this.nom_client = null;
    this.code_client = null;
    this.type_client = null;
    this.numero_facture = null;
    this.libelle_prestation = null;
    this.code_partenaire = null;
    this.nom_partenaire = null;
    this.numero_rapport = null;
    this.numero_mandat = null;
    this.nom_mandat = null;
  }
}
