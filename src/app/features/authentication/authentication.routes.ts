import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { SsoAuthenticationComponent } from './sso-authentication/sso-authentication.component';

export default [
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'forgot',
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset/:token',
        component: ResetPasswordComponent,
      },
      {
        path: 'sso/:token',
        component: SsoAuthenticationComponent,
      },
    ],
  },
] as Route[];
