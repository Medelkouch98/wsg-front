import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { roundNumberTwoDecimals } from '@app/helpers';
import { IDetailsRowsForm } from '../models';

@Injectable()
export class FacturationValidator {
  /**
   * vérifier si la remise en euro est supérieur au montant ht brut
   * @return ValidatorFn
   */
  public remiseGreaterThanPriceHtBrut(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent as FormGroup<IDetailsRowsForm>; // Use `control.parent` to access the parent FormGroup
      if (formGroup) {
        const ttc_base = roundNumberTwoDecimals(
          formGroup.controls.montant_ht_brut.value *
            (1 + formGroup.controls.taux_tva.value / 100)
        );
        return ttc_base - formGroup.controls.remise_euro.value < 0
          ? { invalidRemise: true }
          : null;
      }
      return null;
    };
  }
}
