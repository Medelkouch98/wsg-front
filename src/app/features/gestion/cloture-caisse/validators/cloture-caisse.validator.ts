import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {IClotureCaisseActionsFormGroup, IComptageFormGroup, IComptageRowForm,} from '../models';

/**
 * Custom validator to check if both start and end date fields are in the same month and year
 * @returns A validator function that can be used with FormGroup.
 */
export function sameYearAndMonthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup<IClotureCaisseActionsFormGroup>;
    const startDateControl = form.controls.date_debut;
    const startDate = form.controls.date_debut.value;
    const endDate = form.controls.date_fin.value;

    const startYear = new Date(startDate).getFullYear();
    const startMonth = new Date(startDate).getMonth();
    const endYear = new Date(endDate).getFullYear();
    const endMonth = new Date(endDate).getMonth();

    if (!startDate || !endDate) {
      return null;
    }

    if (startYear !== endYear || startMonth !== endMonth) {
      startDateControl.setErrors({ sameMonthAndYear: true });
    } else {
      const errors: ValidationErrors = {
        ...startDateControl.errors,
      };
      delete errors.sameMonthAndYear;
      if (Object.keys(errors).length === 0) {
        startDateControl.setErrors(null);
      } else {
        startDateControl.setErrors(errors);
      }
    }
    return null;
  };
}

/**
 * Custom validator to check if there are any comptages that are still not saved
 * @returns A validator function that can be used with FormGroup.
 */
export function notAllRowsAreSavedValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const rowsFormArray = (control as FormGroup<IComptageFormGroup>).controls
      .comptageRowsForm as FormArray<FormGroup<IComptageRowForm>>;

    // Check if any row has isNew === true (row not yet saved)
    const hasNewRow = rowsFormArray.controls.some(
      (row: FormGroup<IComptageRowForm>) => row.get('isNew')?.value === true
    );

    return hasNewRow ? { notAllRowsAreSaved: true } : null;
  };
}
