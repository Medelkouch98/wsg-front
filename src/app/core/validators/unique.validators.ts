import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { IUserControleurAttachRowForm } from 'app/features/settings/users/models';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';
import { UsersService } from '../../features/settings/users/services/users.service';

@Injectable()
export class UniqueValidator {
  constructor(private usersService: UsersService) {}

  /**
   * Returns an asynchronous validator function that checks if the input string is a unique login.
   * If the control's value is equal to the initial value, the function returns null.
   * Otherwise, it checks if the login already exists using the usersService.isLoginExists method.
   *
   * @param {string} initialValue - The initial value of the control.(ignore the unicity test for edit)
   * @returns {AsyncValidatorFn} An asynchronous validator function that returns an Observable of ValidationErrors or null.
   */
  public uniqueLogin =
    (initialValue?: string): AsyncValidatorFn =>
    (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      if (control.pristine || (initialValue && control.value === initialValue))
        return of(null);
      return of(null).pipe(
        filter(() => control.value && !control.errors && control.enabled),
        switchMap(() => this.usersService.isLoginExists(control.value)),
        map((exists: boolean) => (exists ? { isNotUnique: true } : null)),
        catchError(() => of({ isNotUnique: true }))
      );
    };

  /**
   * Returns a validator function that checks if the login value in a form control is unique within the form.
   * @returns {ValidatorFn} A validator function that takes a form control as input and returns a validation error object
   */
  public uniqueLoginInForm =
    (): ValidatorFn =>
    (control: AbstractControl<string>): ValidationErrors | null => {
      const formArray = control?.parent?.parent as FormArray<
        FormGroup<IUserControleurAttachRowForm>
      >;
      return formArray
        ?.getRawValue()
        .filter(({ login }) => login === control.value).length > 1
        ? { isNotUnique: true }
        : null;
    };

  /**
   * Returns an asynchronous validator function that checks if an agreement is unique
   * @returns {AsyncValidatorFn} An asynchronous validator function that returns an Observable of ValidationErrors or null
   */
  public uniqueAgrement =
    (): AsyncValidatorFn =>
    (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      if (control.pristine) return of(null);
      return of(null).pipe(
        filter(() => control.value && !control.errors && control.enabled),
        switchMap(() => this.usersService.isAgrementExists(control.value)),
        map((exists: boolean) => (exists ? { isNotUnique: true } : null)),
        catchError(() => of({ isNotUnique: true }))
      );
    };
}
