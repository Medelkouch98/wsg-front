import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { RemainingTime } from '@app/models';
import * as moment from 'moment/moment';

export const roundNumberTwoDecimals = (num: number): number => {
  return Math.trunc(num * 100) / 100;
};
export const roundNumberTreeDecimals = (num: number): number => {
  return Math.trunc(num * 1000) / 1000;
};
export const formaterDate = (date: string | Date): string => {
  return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
};
export class GlobalHelper {
  /**
   * Récupérer seulement les contrôles modifiés
   * @param formItem FormGroup | FormControl | FormArray
   * @param updatedValues { [key: string]: any }
   * @param name
   */
  static getUpdatedControles(
    formItem: FormGroup | FormControl | FormArray,
    updatedValues: { [key: string]: any },
    name?: string
  ) {
    if (formItem instanceof FormControl) {
      if (name && formItem.dirty) {
        updatedValues[name] = formItem.value;
      }
    } else {
      for (const formControlName in formItem.controls) {
        if (formItem.controls.hasOwnProperty(formControlName)) {
          const formControl = (
            formItem.controls as { [key: string]: AbstractControl }
          )[formControlName];

          if (formControl instanceof FormControl) {
            this.getUpdatedControles(
              formControl,
              updatedValues,
              formControlName
            );
          } else if (
            formControl instanceof FormArray &&
            formControl.dirty &&
            formControl.controls.length > 0
          ) {
            updatedValues[formControlName] = [];
            this.getUpdatedControles(
              formControl,
              updatedValues[formControlName]
            );
          } else if (formControl instanceof FormGroup && formControl.dirty) {
            updatedValues[formControlName] = {};
            this.getUpdatedControles(
              formControl,
              updatedValues[formControlName]
            );
          }
        }
      }
    }
  }

  /**
   * Returns an object containing the updated values from a given form group or form array.
   *
   * @param {FormGroup<any> | FormArray<any>} form - The form group or form array to get dirty values from.
   * @returns {any} - The object containing the updated values.
   */
  static getDirtyValues(form: FormGroup<any> | FormArray<any>): any {
    const dirtyValues: any = Object.entries(form.controls).reduce(
      (acc: any, [key, currentControl]: [string, any]) => {
        if (currentControl.dirty) {
          acc[key] = currentControl.controls
            ? this.getDirtyValues(currentControl)
            : currentControl.value;
        }
        return acc;
      },
      {}
    );

    return form instanceof FormArray ? Object.values(dirtyValues) : dirtyValues;
  }

  /**
   * convert nested object into flat object
   * ex:  object = { a: '1', b: { c: '2', d: { e: '3' } } } => result: {a: 1, b_c: 2, b_d_e: 3}
   * @param object
   * @param parents
   * @param separator
   */
  static flattenObject(
    object: any,
    parents: any = [],
    separator: string = '_'
  ): any {
    return Object.assign(
      {},
      ...Object.entries(object).map(([k, v]) => {
        return v && typeof v === 'object' && !(v instanceof File) // si v est de type file on ne veut pas faire un flatten, pour garder la structure de l'objet File
          ? this.flattenObject(v, [...parents, k], separator)
          : { [[...parents, k].join(separator)]: v };
      })
    );
  }

  static removeEmptyFields(obj: any): any {
    Object.entries(obj).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === -1
      ) {
        delete obj[key];
      } else if (typeof value === 'object' && !(value instanceof File)) {
        GlobalHelper.removeEmptyFields(value);
        if (Object.keys(value).length === 0) {
          delete obj[key];
        }
      }
    });
    return obj;
  }

  /**
   * transformer un objet en formData
   * @param obj
   * @returns {FormData}
   */
  static objectToFormData(obj: any): FormData {
    const formData = new FormData();
    const flattenedObject = GlobalHelper.flattenObject(obj, [], '.');
    Object.entries(flattenedObject).forEach(([key, value]: [string, any]) => {
      if (value) {
        const [first, ...rest] = key.split('.');
        let formDataKey = first;
        for (const lineKey of rest) {
          formDataKey += `[${lineKey}]`;
        }
        if (value instanceof Array) {
          value.forEach((v, index) =>
            formData.append(`${formDataKey}[${index}]`, v)
          );
        } else {
          formData.append(formDataKey, value);
        }
      }
    });
    return formData;
  }

  /**
   * Formatte une durée en jours, heures, minutes et secondes à partir d'un horodatage donné.
   *
   * @param {number} date - L'horodatage à formater.
   * @returns {RemainingTime} - Objet contenant les jours, les heures, les minutes et les secondes formatés.
   */
  static formatDuration(date: number): RemainingTime {
    if (date < 0) return null;
    const days = Math.floor(date / (1000 * 60 * 60 * 24));
    const hours = Math.floor((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((date % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }
}
