import { Injectable, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';
import { RolesService } from '../services/roles.service';

@Injectable()
export class RoleValidator {
  private rolesService = inject(RolesService);

  public uniqueRoleName =
    (): AsyncValidatorFn =>
    (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      return of(null).pipe(
        filter(() => control.value && !control.errors),
        switchMap(() => this.rolesService.isRoleNameExists(control.value)),
        map((exists: boolean) => (exists ? { isNotUnique: true } : null)),
        catchError(() => of({ isNotUnique: true }))
      );
    };
}
