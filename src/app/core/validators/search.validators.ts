import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ISearchFormGroup } from 'app/features/activity/components/advanced-search/advanced-search-form/models/search-form-group.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SearchValidators {
  /**
   * Custom validator that checks if both start and end date fields are empty.
   * @param startField The name of the start date field in the form.
   * @param endField The name of the end date field in the form.
   * @returns A validator function that can be used with FormGroup.
   */
  emptyIntervalValidator(startField: string, endField: string): ValidatorFn {
    return (formGroup: AbstractControl): null => {
      const search = formGroup as FormGroup<ISearchFormGroup>;
      const startDateControl = search.get(startField);
      const endDateControl = search.get(endField);
      const error =
        !startDateControl.value && !endDateControl.value
          ? { emptyInterval: true }
          : null;
      startDateControl.setErrors(error);
      return null;
    };
  }

  /**
   * vérifier que la période est de 30 jours max
   */
  intervalLengthValidator(
    startField: string,
    endField: string,
    duration: number
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const search = formGroup as FormGroup<ISearchFormGroup>;
      const startDate = search.get(startField).value;
      const endDate = search.get(endField).value;
      if (!startDate || !endDate) {
        return null;
      }
      const diffInDays = moment(endDate).diff(moment(startDate), 'days');
      return diffInDays > duration ? { intervalLengthInvalid: true } : null;
    };
  }
}
