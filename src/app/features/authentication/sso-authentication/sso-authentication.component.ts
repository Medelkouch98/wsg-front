import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import * as authActions from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-sso-authentication',
  standalone: true,
  template: '',
})
export class SsoAuthenticationComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(authActions.SsoAuthentication());
  }
}
