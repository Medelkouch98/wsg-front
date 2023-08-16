import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IDetailsRowsForm } from './details-form-group.model';
import { IDetailPrestation, IPrestationFacture } from '@app/models';
import { FacturationValidator } from '../validators/facturation.validator';

export interface IPrestationFormGroup {
  prestationsRowsForm: FormArray<FormGroup<IPrestationRowsForm>>;
}

export interface IPrestationRowsForm {
  code: FormControl<string>;
  libelle: FormControl<string>;
  montant_ht_brut: FormControl<number>;
  montant_ht_net: FormControl<number>;
  montant_ttc: FormControl<number>;
  quantite: FormControl<number>;
  remise_ttc: FormControl<number>;
  details: FormArray<FormGroup<IDetailsRowsForm>>;
}

/**
 * remplire le formulaire
 * @param {IPrestationFacture[]} prestations
 * @param {FormBuilder} fb
 * @param {FacturationValidator} facturationValidator
 * @return {FormGroup<IPrestationFormGroup>}
 */
export const initPrestationsForm = (
  prestations: IPrestationFacture[],
  fb: FormBuilder,
  facturationValidator: FacturationValidator
): FormGroup<IPrestationFormGroup> => {
  const prestationsFormArray: FormArray<FormGroup<IPrestationRowsForm>> =
    fb.array([] as FormGroup<IPrestationRowsForm>[]);

  prestations?.forEach((presta: IPrestationFacture) => {
    const detailsFormArray: FormArray<FormGroup<IDetailsRowsForm>> = fb.array(
      presta.details?.map((detail: IDetailPrestation) =>
        fb.group<IDetailsRowsForm>({
          code_prestation: fb.control(detail.code_prestation),
          controle_id: fb.control(detail.controle_id),
          immatriculation: fb.control(detail.immatriculation),
          libelle_prestation: fb.control(detail.libelle_prestation),
          montant_ht_brut: fb.control(detail.montant_ht_brut),
          montant_ht_net: fb.control(detail.montant_ht_net),
          montant_ttc: fb.control(detail.montant_ttc),
          montant_tva: fb.control(detail.montant_tva),
          numero_bon_livraison: fb.control(detail.numero_bon_livraison),
          prestation_id: fb.control(detail.prestation_id),
          proprietaire: fb.control(detail.proprietaire),
          prospect_id: fb.control(detail.prospect_id),
          remise_euro: fb.control(detail.remise_euro, [
            Validators.min(0),
            facturationValidator.remiseGreaterThanPriceHtBrut(),
          ]),
          remise_pourcentage: fb.control(detail.remise_pourcentage, [
            Validators.min(0),
            Validators.max(100),
          ]),
          taux_tva: fb.control(detail.taux_tva),
          reotc: fb.control(detail.reotc),
        })
      )
    );
    prestationsFormArray.push(
      fb.group<IPrestationRowsForm>({
        code: fb.control(presta.code),
        libelle: fb.control(presta.libelle),
        quantite: fb.control(presta.quantite),
        remise_ttc: fb.control(presta.remise_ttc),
        montant_ttc: fb.control(presta.montant_ttc),
        montant_ht_brut: fb.control(presta.montant_ht_brut),
        montant_ht_net: fb.control(presta.montant_ht_net),
        details: detailsFormArray,
      })
    );
  });

  return fb.group({
    prestationsRowsForm: prestationsFormArray,
  });
};
