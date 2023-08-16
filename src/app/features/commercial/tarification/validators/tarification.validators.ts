import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ITarificationRowForm } from '../models';

@Injectable()
export class TarificationValidators {
  /**
   * une remise est obligatoire pour la création ou la modification
   * de tarification
   */
  public remiseRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): null => {
      const formGroup = control as FormGroup<ITarificationRowForm>;
      const remiseEuro = formGroup.controls.remise_euro;
      const remisePourcentage = formGroup.controls.remise_pourcentage;
      if (remiseEuro?.value === null && remisePourcentage?.value === null) {
        remiseEuro?.setErrors({ required: true });
        remisePourcentage?.setErrors({ required: true });
      } else {
        const remiseEuroErrors = remiseEuro?.errors;
        const remisePourcentageErrors = remisePourcentage?.errors;
        if (remiseEuro.value) {
          remiseEuro?.setErrors(
            remiseEuroErrors && Object.keys(remiseEuroErrors).length === 0
              ? null
              : remiseEuroErrors
          );
          remisePourcentage.setErrors(null);
        } else {
          formGroup.controls.remise_pourcentage?.setErrors(
            remisePourcentageErrors &&
              Object.keys(remisePourcentageErrors).length === 0
              ? null
              : remisePourcentageErrors
          );
          remiseEuro.setErrors(null);
        }
      }
      return null;
    };
  }
}
