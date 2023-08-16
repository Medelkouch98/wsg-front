import { IClient } from './client.model';
import {
  sommeMontantHtBrut,
  sommeMontantHtNet,
  sommeMontantTtc,
  calculateRemiseTtc,
} from '../../features/gestion/shared/helper/facture.helper';
import { IPrestation } from './prestation.model';

export interface IFacture {
  id: number;
  numero_facture: string;
  avoir: boolean;
  montant_ttc: number;
  montant_ht: number;
  montant_regle: number;
  date_facture: string;
  solde: number;
  facture_type: number;
  // le cas de searchFacture
  nom_client?: string;
  numero_cloture_caisse?: number;
  refacturation_id?: number;
  type_reglement?: number;
  reglement_negocie?: number;
  agrement?: string;
  mandant?: string;
  avoir_id?: number;
  client_id?: number;

  // le cas de get facture
  observation?: string;
  date_echeance?: string;
  client?: IClient;
  prestations: IPrestationFacture[];
}

export interface IPrestationFacture {
  code: string;
  libelle: string;
  montant_ht_brut: number;
  montant_ht_net: number;
  montant_ttc: number;
  quantite: number;
  remise_ttc: number;
  details: IDetailPrestation[];
}

export class PrestationFacture implements IPrestationFacture {
  constructor(
    public code: string = null,
    public libelle: string = null,
    public montant_ht_brut: number = 0,
    public montant_ht_net: number = 0,
    public montant_ttc: number = 0,
    public quantite: number = 0,
    public remise_ttc: number = 0,
    public details: IDetailPrestation[] = []
  ) {}

  /**
   * retirer le detail prestation
   * @param prestationFacture IPrestationFacture
   * @param prestationDetail IDetailPrestation
   * @param index number
   * @return PrestationFacture
   */
  static takeoffPrestationDetail(
    prestationFacture: IPrestationFacture,
    prestationDetail: IDetailPrestation,
    index: number
  ): PrestationFacture {
    const details = prestationFacture.details.filter(
      (_: IDetailPrestation, i: number) => i !== index
    );
    const montant_ht_brut = sommeMontantHtBrut(details);
    const montant_ht_net = sommeMontantHtNet(details);
    const montant_ttc = sommeMontantTtc(details);
    const quantite = details.length;
    const remise_ttc =
      prestationFacture.remise_ttc - calculateRemiseTtc([prestationDetail]);
    return new PrestationFacture(
      prestationFacture.code,
      prestationFacture.libelle,
      montant_ht_brut,
      montant_ht_net,
      montant_ttc,
      quantite,
      remise_ttc,
      details
    );
  }
}

export interface IDetailPrestation {
  code_prestation: string;
  controle_id: number;
  immatriculation?: string;
  libelle_prestation: string;
  montant_ht_brut: number;
  montant_ht_net: number;
  montant_ttc: number;
  montant_tva: number;
  numero_bon_livraison?: number;
  prestation_id: number;
  proprietaire?: string;
  prospect_id: number;
  remise_euro: number;
  remise_pourcentage: number;
  taux_tva: number;
  reotc?: IDetailPrestation;
}
export class DetailPrestation implements IDetailPrestation {
  code_prestation: string;
  controle_id: number;
  libelle_prestation: string;
  montant_ht_brut: number;
  montant_ht_net: number;
  montant_ttc: number;
  montant_tva: number;
  prestation_id: number;
  prospect_id: number;
  remise_euro: number;
  remise_pourcentage: number;
  taux_tva: number;
  constructor(prestation: IPrestation) {
    this.code_prestation = prestation.code || null;
    this.libelle_prestation = prestation.libelle || null;
    this.remise_euro = 0;
    this.remise_pourcentage = 0;
    this.montant_ht_brut = +prestation.prix_ht;
    this.montant_ht_net = 0;
    this.montant_tva = 0;
    this.montant_ttc = 0;
    this.taux_tva = 0;
    this.prospect_id = null;
    this.controle_id = null;
    this.prestation_id = prestation.id || null;
  }
}
