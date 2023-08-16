import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  DetailPrestation,
  IClient,
  IDetailPrestation,
  IEcheance,
  IFacture,
  IPrestation,
  IPrestationFacture,
} from '@app/models';
import * as moment from 'moment';
import {
  ITotalFacture,
  TotalFacture,
  TotalOtc,
  TotalPrestation,
} from './components/facturation-table/models';
import {
  addOrUpdatePrestationFacture,
  calculateRemiseTtc,
  decreaseIndices,
  deleteDetailSelection,
  getClientTarificationByIdPresta,
  getDetailsPrestationFromMap,
  removeDetailPrestation,
  setDetailsSelection,
  sommeMontantHtBrut,
  sommeMontantHtNet,
  sommeMontantTtc,
} from './helper/facture.helper';
import {
  calculatePricesOfPrestation,
  formaterDate,
  roundNumberTreeDecimals,
  roundNumberTwoDecimals,
} from '@app/helpers';
import { FactureTypeEnum } from './enums';

export interface FacturationState {
  dateEcheance: string;
  dateFacture: string;
  observation: string;
  numeroFacture: string;
  client: IClient;
  prestations: IPrestationFacture[];
  expandedPrestation: string;
  detailsSelection: Map<string, Map<number, IDetailPrestation>>;
  totalFacture: ITotalFacture[];
  factureType: FactureTypeEnum;
}

export const initialFacturationState: FacturationState = {
  dateEcheance: '',
  dateFacture: moment().format('YYYY-MM-DD'),
  observation: '',
  numeroFacture: '',
  client: null,
  prestations: [],
  expandedPrestation: '',
  detailsSelection: new Map(),
  totalFacture: [new TotalFacture()],
  factureType: null,
};

@Injectable()
export class FacturationStore extends ComponentStore<FacturationState> {
  // SELECTORS
  dateEcheance$ = this.select((state: FacturationState) => state.dateEcheance);
  dateFacture$ = this.select((state: FacturationState) => state.dateFacture);
  observation$ = this.select((state: FacturationState) => state.observation);
  numeroFacture$ = this.select(
    (state: FacturationState) => state.numeroFacture
  );
  client$ = this.select((state: FacturationState) => state.client);
  prestations$ = this.select((state: FacturationState) => state.prestations);
  expandedPrestation$ = this.select(
    (state: FacturationState) => state.expandedPrestation
  );
  detailsSelection$ = this.select(
    (state: FacturationState) => state.detailsSelection
  );
  totalFacture$ = this.select((state: FacturationState) => state.totalFacture);
  factureType$ = this.select((state: FacturationState) => state.factureType);

  constructor() {
    super(initialFacturationState);
  }

  // UPDATERS

  setDateEcheance = this.updater(
    (state: FacturationState, echeance: IEcheance) => {
      let dateEcheance: string;
      switch (echeance.libelle.toUpperCase()) {
        case '30 JOURS FIN DE MOIS LE 30':
          dateEcheance = moment()
            .add(echeance.nombre_jour, 'day')
            .endOf('month')
            .format('YYYY-MM-DD');
          break;
        case 'COMPTANT':
        case '30 JOURS NET':
        case '60 JOURS NET':
          dateEcheance = moment()
            .add(echeance.nombre_jour, 'day')
            .format('YYYY-MM-DD');
          break;
        default:
          dateEcheance = '';
          break;
      }
      return {
        ...state,
        dateEcheance,
      };
    }
  );

  setFactureData = this.updater(
    (state: FacturationState, facture: IFacture) => {
      return {
        ...state,
        observation: facture?.observation,
        dateEcheance: facture?.date_echeance
          ? formaterDate(facture?.date_echeance)
          : '',
        client: facture?.client,
        prestations: facture?.prestations,
        expandedPrestation: facture?.prestations[0]?.code,
        detailsSelection: new Map(),
      };
    }
  );

  setFactureType = (factureType: FactureTypeEnum) =>
    this.patchState({
      factureType,
    });

  setClient = (client: IClient) =>
    this.patchState({
      client,
    });

  setObsevation = (observation: string) =>
    this.patchState({
      observation,
    });

  setExpandedPrestation = (expandedPrestation: string) =>
    this.patchState({
      expandedPrestation,
    });

  /**
   * Appliquer les remises du client pro aux prestations bénéficiant d'une remise
   */
  attachRemiseClientToPrestations = this.updater((state: FacturationState) => {
    let { client, prestations } = state;
    prestations = prestations.map((prestation: IPrestationFacture) => {
      // Vérifier si le client bénéficie d'une remise sur la prestation.
      // prendre le 1er detail car les détails sont regroupés par prestation,
      // ce qui entraîne la présence du même prestation_id dans tout le tableau de détails de chaque prestation.
      const tarification = getClientTarificationByIdPresta(
        client.clientPro.prestations,
        prestation.details[0]?.prestation_id
      );
      if (tarification) {
        const updatedDetails = prestation.details.map(
          (detail: IDetailPrestation) => {
            // appliquer la remise de client pro et recalculer les prix
            detail = {
              ...detail,
              remise_pourcentage: tarification.remise_pourcentage,
              remise_euro: tarification.remise_euro,
              ...calculatePricesOfPrestation(
                detail.montant_ht_brut,
                detail.taux_tva,
                tarification.remise_euro,
                tarification.remise_pourcentage
              ),
            };
            return detail;
          }
        );
        return {
          ...prestation,
          details: updatedDetails,
          montant_ttc: sommeMontantTtc(updatedDetails),
          montant_ht_net: roundNumberTreeDecimals(
            sommeMontantHtNet(updatedDetails)
          ),
          montant_ht_brut: roundNumberTreeDecimals(
            sommeMontantHtBrut(updatedDetails)
          ),
          remise_ttc: roundNumberTreeDecimals(
            calculateRemiseTtc(updatedDetails)
          ),
        };
      }
      return prestation;
    });
    return {
      ...state,
      prestations,
    };
  });

  /**
   * Sélectionner ou désélectionner une prestation
   */
  selectOrUnSelectDetailPrestation = this.updater(
    (
      state: FacturationState,
      data: {
        detailsPrestation: IDetailPrestation[];
        isChecked: boolean;
        index?: number;
      }
    ) => {
      // index utiliser lors de check uncheck d'un detail de prestation
      const { detailsPrestation, isChecked, index } = data;
      let detailsSelection: Map<
        string,
        Map<number, IDetailPrestation>
      > = state.detailsSelection;
      // dans le cas de select and unselect de la prestation facture (facturation-table)
      // ou prestation detail (facturation-details-table)
      detailsPrestation.forEach(
        (row: IDetailPrestation, i: number) =>
          (detailsSelection = isChecked
            ? setDetailsSelection(row, index ?? i, detailsSelection)
            : deleteDetailSelection(
                row.code_prestation,
                index ?? i,
                detailsSelection
              ))
      );
      return {
        ...state,
        detailsSelection: new Map<string, Map<number, IDetailPrestation>>(
          detailsSelection
        ),
      };
    }
  );

  /**
   * Calculer le total de la facture à partir des prestations sélectionnées
   */
  calculateTotalFacture = this.updater((state: FacturationState) => {
    let detailsSelection = getDetailsPrestationFromMap(state.detailsSelection);
    const total_prestation = new TotalPrestation();
    const total_otc = new TotalOtc();
    let htPrestation = 0;
    detailsSelection.forEach((element: IDetailPrestation) => {
      htPrestation += element.montant_ht_net;
      total_prestation.ht += roundNumberTwoDecimals(element.montant_ht_net);
      total_prestation.ttc += roundNumberTwoDecimals(element.montant_ttc);
      total_prestation.tva += roundNumberTwoDecimals(element.montant_tva);
      if (element.reotc) {
        total_prestation.ht += roundNumberTwoDecimals(
          element.reotc.montant_ht_net
        );
        total_prestation.ttc += roundNumberTwoDecimals(
          element.reotc.montant_ttc
        );
        total_prestation.tva += roundNumberTwoDecimals(
          element.reotc.montant_tva
        );
        total_otc.ttc += element.reotc.montant_ttc;
        total_otc.ht += element.reotc.montant_ht_net;
      }
    });
    return {
      ...state,
      totalFacture: [
        new TotalFacture(total_prestation, total_otc, htPrestation),
      ],
    };
  });

  /**
   * Calculer la remise du detail de la prestation
   */
  calculateRemisePrestationDetail = this.updater(
    (
      state: FacturationState,
      data: { detailPrestation: IDetailPrestation; index: number }
    ) => {
      let { detailPrestation, index } = data;
      // calculer la remise
      detailPrestation = {
        ...detailPrestation,
        ...calculatePricesOfPrestation(
          detailPrestation.montant_ht_brut,
          detailPrestation.taux_tva,
          detailPrestation.remise_euro,
          detailPrestation.remise_pourcentage
        ),
      };
      // Remplacer le détail de la prestation dans la liste des détails sélectionnés par celui qui a été modifié.
      let detailselection = state.detailsSelection;
      detailselection
        .get(detailPrestation.code_prestation)
        ?.set(index, detailPrestation);

      // Remplacer le détail de la prestation dans la liste des prestations par celui qui a été modifié.
      // Recalculer les montants dans la prestation facture
      const prestations = state.prestations.map(
        (prestation: IPrestationFacture) => {
          if (prestation.code === detailPrestation.code_prestation) {
            const updatedDetails = prestation.details.map(
              (detail: IDetailPrestation, i: number) => {
                if (i === index) {
                  return detailPrestation;
                }
                return detail;
              }
            );
            return {
              ...prestation,
              details: updatedDetails,
              montant_ttc: sommeMontantTtc(updatedDetails),
              montant_ht_net: roundNumberTreeDecimals(
                sommeMontantHtNet(updatedDetails)
              ),
              montant_ht_brut: roundNumberTreeDecimals(
                sommeMontantHtBrut(updatedDetails)
              ),
              remise_ttc: roundNumberTreeDecimals(
                calculateRemiseTtc(updatedDetails)
              ),
            };
          }
          return prestation;
        }
      );

      return {
        ...state,
        prestations,
        detailsSelection: new Map<string, Map<number, IDetailPrestation>>(
          detailselection
        ),
      };
    }
  );

  /**
   * Ajouter une préstation diverse
   */
  addPrestationDiverse = this.updater(
    (
      state: FacturationState,
      data: { newPrestation: IPrestation; tauxTva: string }
    ) => {
      let detailPrestation = new DetailPrestation(data.newPrestation);
      detailPrestation.taux_tva = +data.tauxTva;

      let prestations = state.prestations;
      prestations = addOrUpdatePrestationFacture(
        prestations,
        detailPrestation,
        state.client
      );
      return {
        ...state,
        prestations,
        expandedPrestation: detailPrestation.code_prestation,
      };
    }
  );

  /**
   * Changer le detail d'une prestation par une autre prestation
   */
  changePrestationDetail = this.updater(
    (
      state: FacturationState,
      data: {
        detailPrestation: IDetailPrestation;
        newPrestation: IPrestation;
        tauxTva: string;
        index: number;
      }
    ) => {
      const { detailPrestation, newPrestation, tauxTva, index } = JSON.parse(
        JSON.stringify(data)
      );
      const { code_prestation } = data.detailPrestation;
      detailPrestation.code_prestation = newPrestation.code;
      detailPrestation.prestation_id = newPrestation.id;
      detailPrestation.libelle_prestation = newPrestation.libelle;
      detailPrestation.montant_ht_brut = Number(newPrestation.prix_ht);
      detailPrestation.taux_tva = +tauxTva;

      // retirer detailPrestation de la prestationFacture
      let prestations = removeDetailPrestation(
        state.prestations,
        detailPrestation,
        index,
        code_prestation
      );

      // Ajouter ou modifier la prestation facture
      prestations = addOrUpdatePrestationFacture(
        prestations,
        detailPrestation,
        state.client
      );
      let detailsSelection = state.detailsSelection;
      if (detailsSelection.has(code_prestation)) {
        detailsSelection = deleteDetailSelection(
          code_prestation,
          index,
          detailsSelection
        );
        decreaseIndices(detailsSelection, code_prestation, index);
        const indexPrestation = prestations.findIndex(
          (row: IPrestationFacture) =>
            row.code === detailPrestation.code_prestation
        );
        if (indexPrestation !== -1) {
          const indexNewPrestation =
            prestations[indexPrestation].details.length - 1;
          detailsSelection = setDetailsSelection(
            detailPrestation,
            indexNewPrestation,
            detailsSelection
          );
        }
      }
      return {
        ...state,
        prestations,
        detailsSelection: new Map<string, Map<number, IDetailPrestation>>(
          detailsSelection
        ),
        expandedPrestation: detailPrestation.code_prestation,
      };
    }
  );
}
