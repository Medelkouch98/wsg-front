import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { SIV_FNI_REGEX } from '@app/config';
import { IImmatriculationControlFormGroupModel } from './models/immatriculation-control-form-group.model';

@Injectable()
export class ImmatriculationValidators {
  /**
   * Validateur pour vérifier si l'immatriculation
   * respecte le format SIV/FNI
   * @returns ValidatorFn
   */
  static formatValidator(): ValidatorFn {
    return (control: AbstractControl): null => {
      const formGroup =
        control as FormGroup<IImmatriculationControlFormGroupModel>;
      const immatriculation =
        formGroup.controls.immatriculation.value?.toUpperCase();
      const formatSivFni = !!formGroup.controls.formatSivFni.value;
      if (immatriculation) {
        if (formatSivFni && !SIV_FNI_REGEX.test(immatriculation)) {
          formGroup.controls.immatriculation.setErrors({
            pattern: true,
          });
        } else {
          formGroup.controls.immatriculation.setErrors(null);
        }
      }
      return null;
    };
  }
}
