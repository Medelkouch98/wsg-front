import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({ name: 'error', standalone: true })
export class FormControlErrorPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    error: ValidationErrors,
    pattern: string = null,
    field: string = null
  ): string {
    return this.getErrorMessage(error, pattern, field);
  }

  /**
   * This method generates list of error message based on the errors object
   * Errors must be ordered by priority
   * @param errors ValidationErrors
   * @param pattern to show on the specific pattern error message
   * @param field field name to display in error message
   * @returns
   */
  private getErrorMessage(
    errors: ValidationErrors,
    pattern: string,
    field: string
  ): string {
    if (!errors) {
      return '';
    }
    if (errors.required) {
      const fieldName = this.translateService.instant(
        `commun.${field ?? 'field'}`
      );
      return this.translateService.instant('validators.required', {
        fieldName,
      });
    }
    if (errors.minlength) {
      return this.translateService.instant('validators.minLength', {
        value: errors.minlength.requiredLength,
      });
    }
    if (errors.maxlength) {
      return this.translateService.instant('validators.maxLength', {
        value: errors.maxlength.requiredLength,
      });
    }
    if (errors.min) {
      return this.translateService.instant('validators.min', {
        value: errors.min.min,
      });
    }
    if (errors.max) {
      return this.translateService.instant('validators.max', {
        value: errors.max.max,
      });
    }
    if (errors.pattern) {
      return this.translateService.instant(`validators.${pattern}`);
    }
    if (errors.matDatepickerParse) {
      return this.translateService.instant('validators.matDatepickerParse');
    }

    if (errors.matEndDateInvalid) {
      return this.translateService.instant('validators.matEndDateInvalid');
    }
    if (errors.matStartDateInvalid) {
      return this.translateService.instant('validators.matStartDateInvalid');
    }

    if (errors.emptyInterval) {
      return this.translateService.instant('validators.emptyInterval');
    }

    if (errors.invalidDateRange) {
      return this.translateService.instant('validators.invalidDateRange');
    }
    if (errors.matDatepickerMax) {
      const date = moment(errors.matDatepickerMax.max).format('DD/MM/YYYY');
      const today = moment(new Date()).format('DD/MM/YYYY');
      if (today === date) {
        return this.translateService.instant(
          'validators.matDatepickerMaxToday'
        );
      } else {
        const date = moment(errors.matDatepickerMax.max).format('DD/MM/YYYY');
        return this.translateService.instant('validators.matDatepickerMax', {
          libelle: field || '',
          max: date,
        });
      }
    }
    if (errors.matDatepickerMin) {
      const date = moment(errors.matDatepickerMin.min).format('DD/MM/YYYY');
      const today = moment(new Date()).format('DD/MM/YYYY');
      if (today === date) {
        return this.translateService.instant(
          'validators.matDatepickerMinToday'
        );
      } else {
        return this.translateService.instant('validators.matDatepickerMin', {
          libelle: field || 'saisie',
          min: date,
        });
      }
    }
    if (errors.numberRange) {
      return this.translateService.instant('validators.numberRange');
    }
    if (errors.isNotUnique) {
      return this.translateService.instant('validators.isNotUnique');
    }
    if (errors.mineur) {
      return this.translateService.instant('validators.minAge');
    }
    if (errors.sameMonthAndYear) {
      return this.translateService.instant('validators.sameMonthAndYear');
    }
    if (errors.clotureExist) {
      return this.translateService.instant(
        'gestion.errors.clotureCaisseExiste'
      );
    }
    if (errors.minExclusive) {
      return this.translateService.instant('validators.minExclusive', {
        value: errors.minExclusive.minValue,
      });
    }
    if (errors.invalidRemise) {
      return this.translateService.instant('validators.remiseSuperieur');
    }
  }
}
