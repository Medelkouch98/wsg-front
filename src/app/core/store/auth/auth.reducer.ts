import { Action, createReducer, on } from '@ngrx/store';
import * as featureActions from '../auth/auth.actions';
import {
  ICurrentUser,
  IWsError,
  Menu,
  CurrentUser,
  ICentre,
  IJwtTokens,
  JwtTokens,
  IModule,
  IControleur,
  ChildrenItems,
  PasswordRetryTimer,
} from '@app/models';
import { PermissionType } from '@app/enums';

export interface AuthState {
  jwtTokens: IJwtTokens;
  refreshTokenInProgress: boolean;
  user: ICurrentUser;
  currentCentre: ICentre;
  modules: IModule[];
  menus: Menu[];
  menuFavoris: ChildrenItems[];
  accessPermissions: PermissionType[];
  unattachedControllers: IControleur[];
  errors?: IWsError;
  forgotPasswordSuccessMessage: string;
  resetPasswordRetryTimer: PasswordRetryTimer[];
  sessionId: string;
}

// Here is the initial state set if no changes happened
export const initialAuthState: AuthState = {
  jwtTokens: new JwtTokens(),
  refreshTokenInProgress: false,
  user: new CurrentUser(),
  currentCentre: null,
  modules: [],
  menus: [],
  menuFavoris: [],
  accessPermissions: [],
  unattachedControllers: [],
  errors: null,
  forgotPasswordSuccessMessage: null,
  resetPasswordRetryTimer: [],
  sessionId: '',
};

const featureReducer = createReducer(
  initialAuthState,
  on(
    featureActions.UpdateCurrentCentre,
    featureActions.SetRefreshTokenInProgress,
    featureActions.GetCurrentUserSuccess,
    featureActions.LoginSuccess,
    featureActions.ForgotResetPasswordError,
    featureActions.ForgotPasswordSuccessMessage,
    featureActions.SetAccessPermissions,
    featureActions.GetCurrentUserModulesSucess,
    featureActions.GetCurrentUserModulesError,
    featureActions.GethUnattachedControllersSucess,
    featureActions.GetUnattachedControllersError,
    featureActions.SetSessionID,
    featureActions.UpdateMenuFavorisSuccess,
    featureActions.UpdateMenuFavorisError,
    (state, action) => ({
      ...state,
      ...action,
    })
  ),
  on(featureActions.InitializeAuthState, () => ({
    ...initialAuthState,
  })),
  on(
    featureActions.RefreshTokenSuccess,
    featureActions.SsoAuthenticationSuccess,
    (state, { token, refresh_token }) => ({
      ...state,
      jwtTokens: {
        ...state.jwtTokens,
        token,
        refresh_token,
      },
    })
  ),
  on(
    featureActions.RefreshTokenError,
    featureActions.LoginError,
    featureActions.SsoAuthenticationError,
    (state, { errors }) => ({
      ...state,
      jwtTokens: new JwtTokens(),
      errors,
    })
  ),
  on(featureActions.GetCurrentUserError, (state, { errors }) => ({
    ...state,
    user: new CurrentUser(),
    menus: [],
    currentCentre: null,
    errors,
  })),
  on(featureActions.ResetError, (state) => ({
    ...state,
    errors: null,
  })),
  on(featureActions.StartRetryTimer, (state, { duration, login }) => ({
    ...state,
    resetPasswordRetryTimer: [
      ...state.resetPasswordRetryTimer,
      {
        endTime: Date.now() + duration * 1000,
        login,
      },
    ],
  })),
  on(featureActions.StopRetryTimer, (state, { login }) => ({
    ...state,
    resetPasswordRetryTimer: state.resetPasswordRetryTimer.filter(
      (e: PasswordRetryTimer) => e.login !== login
    ),
  }))
);

export function authReducer(
  state: AuthState | undefined,
  action: Action
): AuthState {
  return featureReducer(state, action);
}
