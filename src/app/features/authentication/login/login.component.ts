import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { Login, ResetError } from '../../../core/store/auth/auth.actions';
import { UserErrorSelector } from '../../../core/store/auth/auth.selectors';
import { IWsError, ILoginRequest } from '@app/models';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControlErrorPipe } from '@app/pipes';
import { MatInputModule } from '@angular/material/input';
import { FieldControlLabelDirective } from '@app/directives';
import { ILoginFormGroupModel } from './models/login-form-group.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FormControlErrorPipe,
    RouterLink,
    NgIf,
    FieldControlLabelDirective,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  public form: FormGroup<ILoginFormGroupModel>;
  error$: Observable<IWsError>;

  constructor(private store: Store<AppState>, private fb: FormBuilder) {}

  ngOnInit(): void {
    // reset Auth Error
    this.store.dispatch(ResetError());
    this.form = this.fb.group({
      login: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      remember: [false, Validators.compose([Validators.required])],
    });
    this.error$ = this.store.select(UserErrorSelector);
  }

  /**
   * Récupération de du login et mot de passe et authentification de l'utilisateur
   * @returns void
   */
  onSubmit(): void {
    const request: ILoginRequest = {
      login: this.form.controls.login.value,
      password: this.form.controls.password.value,
    };
    this.store.dispatch(Login({ request }));
  }
}
