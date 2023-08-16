import {
  IClient,
  IDetailPrestation,
  IPrestationFacture,
  PrestationFacture,
} from '@app/models';
import { calculatePricesOfPrestation } from '@app/helpers';
import { ITarification } from '../../../commercial/tarification/models';

/**
 * Calculer la somme des montants ht brut
 * @param details IDetailPrestation[]
 * @return number
 */
export const sommeMontantHtBrut = (details: IDetailPrestation[]): number => {
  return details.reduce(
    (acc: number, detail: IDetailPrestation) => acc + detail.montant_ht_brut,
    0
  );
};

/**
 * Calculer la somme des montants ht net
 * @param details IDetailPrestation[]
 * @return number
 */
export const sommeMontantHtNet = (details: IDetailPrestation[]): number => {
  return details.reduce(
    (acc: number, detail: IDetailPrestation) =>
      acc + (detail.montant_ht_net + (detail.reotc?.montant_ht_net ?? 0)),
    0
  );
};

/**
 * Calculer la somme des montants ttc
 * @param details IDetailPrestation[]
 * @return number
 */
export const sommeMontantTtc = (details: IDetailPrestation[]): number => {
  return details.reduce(
    (acc: number, detail: IDetailPrestation) =>
      acc + (detail.montant_ttc + (detail.reotc?.montant_ttc ?? 0)),
    0
  );
};

/**
 * Effectuer le calcul et obtenir le montant total de la remise TTC.
 * @param details IDetailPrestation[]
 * @return number
 */
export const calculateRemiseTtc = (details: IDetailPrestation[]): number => {
  return details.reduce(
    (acc: number, detail: IDetailPrestation) =>
      acc +
      (detail.montant_ht_brut * (1 + detail.taux_tva / 100) -
        detail.montant_ttc),
    0
  );
};

/**
 * Récupérer la liste de details prestation
 * @param {Map<string, Map<number, IDetailPrestation>>} detailsPrestation
 * @returns {IDetailPrestation[]}
 */
export const getDetailsPrestationFromMap = (
  detailsPrestation: Map<string, Map<number, IDetailPrestation>>
): IDetailPrestation[] => {
  return Array.from(detailsPrestation.values()).flatMap(
    (detailMap: Map<number, IDetailPrestation>) =>
      Array.from(detailMap.values())
  );
};

/**
 * ajouter le detail prestation au Map detailprestation
 * dans le cas ou la prestation existe on insére directement le detail,
 * sinon on ajoute une nouvelle préstation
 * @param {IDetailPrestation} detailPrestation
 * @param {number} index
 * @param {Map<string, Map<number, IDetailPrestation>>} selection
 * @returns {Map<string, Map<number, IDetailPrestation>>}
 */
export const setDetailsSelection = (
  detailPrestation: IDetailPrestation,
  index: number,
  selection: Map<string, Map<number, IDetailPrestation>>
): Map<string, Map<number, IDetailPrestation>> => {
  const { code_prestation } = detailPrestation;
  if (!selection.has(code_prestation)) {
    selection.set(code_prestation, new Map());
  }
  selection.get(code_prestation).set(index, detailPrestation);
  return selection;
};

/**
 * Supprimer les détails de la sélection : si la sélection possède un code de prestation sans détails,
 * nous supprimons complètement la ligne. Sinon, nous supprimons uniquement les détails.
 * @param {string} codePrestation
 * @param {number} index
 * @param {Map<string, Map<number, IDetailPrestation>>} selection
 * @returns {Map<string, Map<number, IDetailPrestation>>}
 */
export const deleteDetailSelection = (
  codePrestation: string,
  index: number,
  selection: Map<string, Map<number, IDetailPrestation>>
): Map<string, Map<number, IDetailPrestation>> => {
  if (selection.has(codePrestation)) {
    selection.get(codePrestation).size === 1
      ? selection.delete(codePrestation)
      : selection.get(codePrestation).delete(index);
  }
  return selection;
};

/**
 * modifier la selection apres suppression d'une ligne dans la selection des details prestation
 * @param {Map<string, Map<number, IDetailPrestation>>} selection
 * @param {string} codePrestation
 * @param {number} deletedIndex
 */
export const decreaseIndices = (
  selection: Map<string, Map<number, IDetailPrestation>>,
  codePrestation: string,
  deletedIndex: number
) => {
  const detailPrestationMap = selection.get(codePrestation);
  if (!detailPrestationMap) return;

  const updatedDetailPrestationMap = new Map(
    Array.from(detailPrestationMap.entries()).map(
      ([index, detailPrestation]) => {
        const newIndex = index > deletedIndex ? index - 1 : index;
        return [newIndex, detailPrestation];
      }
    )
  );
  selection.set(codePrestation, updatedDetailPrestationMap);
};

/**
 * Retirer detailPrestation de la prestationFacture
 * @param {IPrestationFacture[]} prestations
 * @param {IDetailPrestation} detailPrestation
 * @param {number} index
 * @param {string} firstCodePresta
 * @return {IPrestationFacture[]}
 */
export const removeDetailPrestation = (
  prestations: IPrestationFacture[],
  detailPrestation: IDetailPrestation,
  index: number,
  firstCodePresta: string
): IPrestationFacture[] => {
  return prestations
    .map((prestationFacture: IPrestationFacture) => {
      if (
        prestationFacture.details.findIndex(
          (detail: IDetailPrestation, i: number) =>
            i === index && detail.code_prestation === firstCodePresta
        ) !== -1
      ) {
        return PrestationFacture.takeoffPrestationDetail(
          prestationFacture,
          detailPrestation,
          index
        );
      }
      return prestationFacture;
    })
    .filter(
      (prestationFacture: IPrestationFacture) =>
        !!prestationFacture.details.length
    );
};

/**
 * Ajouter une prestation aux prestations facturées dans le cas où elle n'existe pas initialement
 * Sinon, on modifie la prestation initiale en calculant les prix et en ajoutant le détail préstation.
 * @param {IPrestationFacture[]} prestations
 * @param {IDetailPrestation} detailPrestation
 * @param {IClient} client
 * @return {IPrestationFacture[]}
 */
export const addOrUpdatePrestationFacture = (
  prestations: IPrestationFacture[],
  detailPrestation: IDetailPrestation,
  client: IClient
): IPrestationFacture[] => {
  const prestationFacture = prestations.find(
    (prestationFacture: IPrestationFacture) =>
      prestationFacture.code === detailPrestation.code_prestation
  );
  // Appliquer la remise du client s'il s'agit d'un client compte
  if (client.clientPro) {
    // Vérifier si le client bénéficie d'une remise sur la prestation.
    const tarification = getClientTarificationByIdPresta(
      client.clientPro.prestations,
      detailPrestation.prestation_id
    );
    // si oui appliquer la remise du client
    if (tarification) {
      detailPrestation.remise_pourcentage = tarification.remise_pourcentage;
      detailPrestation.remise_euro = tarification.remise_euro;
    }
  }
  // Calculer les prix de detail Prestation
  detailPrestation = {
    ...detailPrestation,
    ...calculatePricesOfPrestation(
      detailPrestation.montant_ht_brut,
      detailPrestation.taux_tva,
      detailPrestation.remise_euro,
      detailPrestation.remise_pourcentage
    ),
  };
  const remise_ttc = calculateRemiseTtc([detailPrestation]);
  if (!prestationFacture) {
    // si la prestation n'existe pas on ajoute une nouvelle prestation
    return [
      ...prestations,
      new PrestationFacture(
        detailPrestation.code_prestation,
        detailPrestation.libelle_prestation,
        +detailPrestation.montant_ht_brut,
        sommeMontantHtNet([detailPrestation]),
        sommeMontantTtc([detailPrestation]),
        1,
        remise_ttc,
        [detailPrestation]
      ),
    ];
  } else {
    // sinon on modifie la prestation existante
    return prestations.map((row: IPrestationFacture) => {
      if (row.code === prestationFacture.code) {
        return {
          ...row,
          montant_ht_brut:
            row.montant_ht_brut + detailPrestation.montant_ht_brut,
          montant_ht_net:
            row.montant_ht_net + sommeMontantHtNet([detailPrestation]),
          montant_ttc: row.montant_ttc + sommeMontantTtc([detailPrestation]),
          quantite: row.quantite + 1,
          details: [...row.details, detailPrestation],
          remise_ttc: row.remise_ttc + remise_ttc,
        };
      }
      return row;
    });
  }
};

/**
 * Récupérer la remise de client sur une prestation par id de prestation
 * @param {ITarification[]} tarification
 * @param {number} prestationId
 * @return {ITarification}
 */
export const getClientTarificationByIdPresta = (
  tarification: ITarification[],
  prestationId: number
): ITarification => {
  return tarification.find(
    (el: ITarification) => el.prestation_id === prestationId
  );
};
