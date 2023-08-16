import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class GlobalValidators {
  /**
   * comparer la valeur du premier numéro avec celle du dernier numéro.
   * @param firstField string
   * @param lastField string
   * @return ValidatorFn
   */
  public numberRangeValidator(
    firstField: string,
    lastField: string
  ): ValidatorFn {
    return (control: AbstractControl): null => {
      const firstNumber = control.get(firstField);
      const lastNumber = control.get(lastField);
      if (
        firstNumber.value &&
        lastNumber.value &&
        lastNumber.value < firstNumber.value
      ) {
        firstNumber.setErrors({ numberRange: true });
      } else {
        const firstNumberErrors = firstNumber?.errors;
        delete firstNumberErrors?.numberRange;
        firstNumber?.setErrors(
          firstNumberErrors && Object.keys(firstNumberErrors).length === 0
            ? null
            : firstNumberErrors
        );
      }
      return null;
    };
  }
}
