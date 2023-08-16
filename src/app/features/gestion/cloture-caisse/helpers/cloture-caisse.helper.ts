import {
  Comptage,
  Ecart,
  IClotureCaisseRecapitulatif,
  IClotureCaisseRequest,
  IComptage,
  IComptageRowForm,
  IInitialReglementSummary,
} from '../models';
import { TypeComptageEnum } from '../enums';
import { ClotureCaisseState } from '../cloture-caisse.store';
import { Validators } from '@angular/forms';
import { POSITIVE_INTEGER } from '@app/config';

export class ClotureCaisseHelper {
  /**
   * transformer ReglementSummary en Comptage
   * @param {IInitialReglementSummary[]} reglementsSummary
   * @return {IComptage[]}
   * @private
   */
  static mapReglementsSummaryToComptage(
    reglementsSummary: IInitialReglementSummary[]
  ): IComptage[] {
    const comptages: IComptage[] = [];
    reglementsSummary
      .filter(
        (s) =>
          ![
            TypeComptageEnum.TYPE_ESPECE,
            TypeComptageEnum.TYPE_ESPECE_BILLET,
            TypeComptageEnum.TYPE_ESPECE_PIECE,
          ].includes(s.type_comptage)
      )
      .forEach((summary) => {
        summary.reglements.map((reglement) => {
          const comptage = new Comptage(summary.type_comptage);
          comptage.montant = reglement.montant_regle;
          comptage.factures = summary.factures;
          comptages.push(comptage);
        });
      });
    return comptages;
  }

  /**
   * recuperation du recapitulatif par ligne
   * @param {ClotureCaisseState} state
   * @param {TypeComptageEnum} modeReglement
   * @return {IClotureCaisseRecapitulatif}
   * @private
   */
  static getRecapitulatif(
    state: ClotureCaisseState,
    modeReglement: TypeComptageEnum
  ): IClotureCaisseRecapitulatif {
    const types: TypeComptageEnum[] =
      modeReglement === TypeComptageEnum.TYPE_ESPECE
        ? [
            TypeComptageEnum.TYPE_ESPECE_BILLET,
            TypeComptageEnum.TYPE_ESPECE_PIECE,
          ]
        : [modeReglement];
    const initialReglementSummary =
      state.clotureCaisseInitialData.reglements_summary.find((r) =>
        types.includes(r.type_comptage)
      );
    const fond_de_caisse =
      modeReglement === TypeComptageEnum.TYPE_ESPECE
        ? state.clotureCaisseInitialData.fond_caisse_initial
        : null;
    const sortie_de_caisse = state.clotureCaisseRequest.comptages
      .filter((r) => TypeComptageEnum.TYPE_SORTIE_CAISSE === r.type)
      ?.map((comptage) => comptage.montant)
      .reduce((sum, currentValue) => sum + currentValue, 0);
    const ecart =
      state.clotureCaisseRequest.ecarts.find((e) => e.type === modeReglement) ||
      new Ecart(modeReglement);
    const total_compte = ClotureCaisseHelper.getTotalEspeces(
      state.clotureCaisseRequest.comptages,
      types
    );
    const total_a_controller =
      modeReglement === TypeComptageEnum.TYPE_ESPECE
        ? total_compte - fond_de_caisse
        : total_compte;
    const total_factures_reglees = initialReglementSummary?.total_factures ?? 0;
    const nb_factures = initialReglementSummary?.count_factures ?? 0;
    return {
      mode_reglement: modeReglement,
      fond_de_caisse,
      sortie_de_caisse,
      total_compte,
      total_a_controller,
      total_factures_reglees,
      difference: total_a_controller - total_factures_reglees,
      nb_factures,
      commentaire: ecart.commentaire,
    };
  }

  /**
   * calculer le total des espèces
   * @param {IComptage[]} comptages
   * @param {TypeComptageEnum[]} types
   * @return {number}
   * @private
   */
  static getTotalEspeces(
    comptages: IComptage[],
    types: TypeComptageEnum[]
  ): number {
    return comptages
      .filter((c) => types.includes(c.type))
      ?.map((comptage) => comptage.montant)
      .reduce((sum, solde) => sum + solde, 0);
  }

  /**
   * calculer les totaux du formulaire de cloture
   * @param {IClotureCaisseRequest} clotureForm
   */
  static setClotureCaisseRequestTotals(
    clotureForm: IClotureCaisseRequest
  ): void {
    clotureForm.total_cb = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_CARTE_BANCAIRE]
    );
    clotureForm.total_cheques = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_CHEQUE]
    );
    clotureForm.total_coupons = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_COUPON]
    );
    clotureForm.total_internet = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_INTERNET]
    );
    clotureForm.total_sorties = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_SORTIE_CAISSE]
    );
    clotureForm.total_virements = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [TypeComptageEnum.TYPE_VIREMENT]
    );
    clotureForm.total_especes = ClotureCaisseHelper.getTotalEspeces(
      clotureForm.comptages,
      [
        TypeComptageEnum.TYPE_ESPECE,
        TypeComptageEnum.TYPE_ESPECE_BILLET,
        TypeComptageEnum.TYPE_ESPECE_PIECE,
      ]
    );
  }

  /**
   * ajouter les validateurs à l'IComptageRowForm selon le type de comptage
   * @param {TypeComptageEnum} type
   * @param {IComptageRowForm} comptageRowForm
   */
  static setComptageRowFormValidators(
    type: TypeComptageEnum,
    comptageRowForm: IComptageRowForm
  ) {
    switch (type) {
      case TypeComptageEnum.TYPE_CHEQUE:
      case TypeComptageEnum.TYPE_INTERNET:
      case TypeComptageEnum.TYPE_VIREMENT: {
        comptageRowForm.nom.addValidators([Validators.required]);
        comptageRowForm.banque.addValidators([Validators.required]);
        comptageRowForm.numero.addValidators([
          Validators.required,
          Validators.pattern(POSITIVE_INTEGER),
          Validators.min(0),
        ]);
        break;
      }
      case TypeComptageEnum.TYPE_CARTE_BANCAIRE:
      case TypeComptageEnum.TYPE_COUPON: {
        comptageRowForm.nom.addValidators([Validators.required]);
        comptageRowForm.numero.addValidators([
          Validators.required,
          Validators.pattern(POSITIVE_INTEGER),
          Validators.min(0),
        ]);
        break;
      }
      case TypeComptageEnum.TYPE_SORTIE_CAISSE: {
        comptageRowForm.nom.addValidators([Validators.required]);
        break;
      }
    }
  }
}
