import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { combineLatest, Observable, timer } from 'rxjs';
import { IWsError, PasswordRetryTimer } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import {
  ForgotPasswordSuccessMessageSelector,
  RetryTimerSelector,
  UserErrorSelector,
} from '../../../core/store/auth/auth.selectors';
import * as authActions from '../../../core/store/auth/auth.actions';
import { ResetError } from '../../../core/store/auth/auth.actions';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FieldControlLabelDirective } from '@app/directives';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { GlobalHelper } from '@app/helpers';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    FieldControlLabelDirective,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  public form: FormGroup<{ login: FormControl<string> }>;
  error$: Observable<IWsError>;
  successMessage$: Observable<string>;
  remainingTime$: Observable<number>;
  currentTimestamp$ = timer(1000, 1000).pipe(map(() => Date.now()));

  constructor(private store: Store<AppState>, private fb: FormBuilder) {}

  ngOnInit(): void {
    // reset Auth Error
    this.store.dispatch(ResetError());
    this.resetMessages();
    this.form = this.fb.group({
      login: ['', Validators.compose([Validators.required])],
    });
    this.error$ = this.store.select(UserErrorSelector);
    this.successMessage$ = this.store.select(
      ForgotPasswordSuccessMessageSelector
    );
    this.remainingTime$ = combineLatest([
      this.currentTimestamp$,
      this.form.controls.login.valueChanges.pipe(
        tap(() => this.resetMessages()),
        debounceTime(400),
        switchMap((login: string) =>
          this.store.pipe(select(RetryTimerSelector(login)))
        )
      ),
    ]).pipe(
      map(([currentTimeStamp, retryTimer]: [number, PasswordRetryTimer]) => {
        const remainingTime = retryTimer?.endTime - currentTimeStamp || 0;
        if (!!retryTimer && remainingTime <= 0) {
          this.store.dispatch(
            authActions.StopRetryTimer({ login: retryTimer?.login })
          );
          this.store.dispatch(authActions.SaveAuthState());
        }
        return remainingTime;
      })
    );
  }

  /**
   * Récupération du login de réinitialisation de mot de passe et envoi de mail
   * @returns void
   */
  onSubmit(): void {
    this.resetMessages();
    const login = this.form.controls.login.value;
    this.store.dispatch(authActions.ForgotPassword({ login }));
  }

  /**
   * reset success Message
   */
  resetMessages() {
    this.store.dispatch(
      authActions.ForgotPasswordSuccessMessage({
        forgotPasswordSuccessMessage: null,
      })
    );
    this.store.dispatch(authActions.ResetError());
  }

  displayRemainingTime(date: number) {
    const remainingTime = GlobalHelper.formatDuration(date);
    const days = remainingTime?.days ? `${remainingTime?.days}j` : '';
    const hours = remainingTime?.hours ? `${remainingTime?.hours}h` : '';
    const minutes = remainingTime?.minutes
      ? `${remainingTime?.minutes}min`
      : '';
    return `${days} ${hours} ${minutes} ${remainingTime?.seconds}s`;
  }
}
