import { IClientProContact } from '../../features/commercial/client/models';
import { ITarification } from '../../features/commercial/tarification/models';

export interface IClientPro {
  id?: number;
  code?: number;
  compte_comptable?: string;
  fax?: string;
  tva_intracommunautaire?: string;
  remise_pourcentage?: number;
  echeance_id?: number;
  facture_multipv_unitaire?: boolean;
  mode_bon_livraison?: number;
  siret?: string;
  code_service?: string;
  facture_releve?: boolean;
  bon_commande_obligatoire?: boolean;
  mode_reglement_id?: number;
  relance_sur?: number;
  contacts?: IClientProContact[];
  prestations?: ITarification[];
  soldeClient?: number;
}
export class ClientPro implements IClientPro {
  id?: number;
  code: number;
  compte_comptable?: string;
  fax?: string;
  tva_intracommunautaire?: string;
  remise_pourcentage?: number;
  echeance_id?: number;
  facture_multipv_unitaire: boolean;
  mode_bon_livraison: number;
  siret?: string;
  code_service?: string;
  facture_releve: boolean;
  bon_commande_obligatoire: boolean;
  mode_reglement_id?: number;
  relance_sur?: number;
  contacts?: IClientProContact[];
  prestations?: ITarification[];
  soldeClient?: number;

  constructor() {
    this.code = null;
    this.compte_comptable = null;
    this.fax = null;
    this.tva_intracommunautaire = null;
    this.remise_pourcentage = 0;
    this.echeance_id = null;
    this.facture_multipv_unitaire = true;
    this.mode_bon_livraison = 1;
    this.siret = null;
    this.code_service = null;
    this.facture_releve = true;
    this.bon_commande_obligatoire = false;
    this.mode_reglement_id = null;
    this.contacts = [];
    this.prestations = [];
  }
}
