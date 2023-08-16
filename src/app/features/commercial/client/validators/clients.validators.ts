import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EMAIL_PATTERN } from '@app/config';
import { IContactRowForm, IHistoriqueFormGroup } from '../models';

@Injectable()
export class ClientsValidators {
  /**
   * Email obligatoire pour la reception des factures
   */
  public emailRequiredToReceiptInvoice(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup<IContactRowForm>;
      const email = formGroup.controls.email;
      if (!!formGroup.controls.recoit_facture?.value && !email?.value) {
        email.setErrors({ required: true });
        email.markAsTouched();
      } else if (!!email?.value && !EMAIL_PATTERN.test(email?.value)) {
        email.setErrors({ pattern: true });
        email.markAsTouched();
      } else {
        email?.setErrors(null);
      }
      return null;
    };
  }

  /**
   * une date est obligatoire pour créer un prospect véhicule
   */
  public dateValiditeRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): null => {
      const formGroup = control as FormGroup<IHistoriqueFormGroup>;
      if (
        !formGroup.controls.date_validite_vtc?.value &&
        !formGroup.controls.date_validite_vtp?.value
      ) {
        formGroup.controls.date_validite_vtc?.setErrors({
          required: true,
        });
        formGroup.controls.date_validite_vtp?.setErrors({
          required: true,
        });
      } else {
        formGroup.controls.date_validite_vtc?.setErrors(null);
        formGroup.controls.date_validite_vtp?.setErrors(null);
      }
      return null;
    };
  }
}
