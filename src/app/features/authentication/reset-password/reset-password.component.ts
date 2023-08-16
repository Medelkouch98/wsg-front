import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { IWsError } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { UserErrorSelector } from '../../../core/store/auth/auth.selectors';
import { PasswordValidators } from '../../../core/validators';
import * as routerSelector from '../../../core/store/router/router.selector';
import { Params, RouterLink } from '@angular/router';
import * as authActions from '../../../core/store/auth/auth.actions';
import { take } from 'rxjs/operators';
import { IResetPasswordConfirmRequest } from '../../../core/auth/models/reset-password-confirm-request.model';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControlErrorPipe } from '@app/pipes';
import { MatInputModule } from '@angular/material/input';
import { FieldControlLabelDirective } from '@app/directives';
import { IResetPasswordFormGroupModel } from './models/reset-password-form-group.model';
import { ResetError } from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormControlErrorPipe,
    RouterLink,
    NgIf,
    FieldControlLabelDirective,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  PASSWORD_MIN_LENGTH = PasswordValidators.PASSWORD_MIN_LENGTH;
  public form: FormGroup<IResetPasswordFormGroupModel>;
  error$: Observable<IWsError>;
  token: string = '';

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    public passwordStrengthValidator: PasswordValidators
  ) {}

  ngOnInit(): void {
    // reset Auth Error
    this.store.dispatch(ResetError());
    this.store
      .pipe(select(routerSelector.RouterParamsSelector), take(1))
      .subscribe((params: Params) => {
        this.token = params.token;
        this.store.dispatch(
          authActions.CheckResetPasswordToken({ token: this.token })
        );
      });
    this.form = this.fb.group(
      {
        newPassword: [
          '',
          Validators.compose([
            Validators.required,
            this.passwordStrengthValidator.validatePasswordPattern,
          ]),
        ],
        newPasswordConfirmation: [
          '',
          Validators.compose([
            Validators.required,
            this.passwordStrengthValidator.validatePasswordPattern,
          ]),
        ],
      },
      { validators: this.passwordStrengthValidator.validateSamePasswords }
    );
    this.error$ = this.store.select(UserErrorSelector);
  }

  /**
   * Récupération des deux mots de passe et changement du mot de passe de l'utilisateur
   * @returns void
   */
  onSubmit(): void {
    const request: IResetPasswordConfirmRequest = {
      password: this.form.controls.newPassword.value,
      password_confirmation: this.form.controls.newPasswordConfirmation.value,
      token: this.token,
    };
    this.store.dispatch(authActions.ResetPassword({ request }));
  }
}
