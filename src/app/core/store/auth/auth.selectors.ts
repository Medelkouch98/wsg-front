import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { PasswordRetryTimer } from '@app/models';

export const selectAuth = createFeatureSelector<AuthState>('auth');

export const IsAuthenticatedSelector = createSelector(
  selectAuth,
  (state: AuthState) =>
    !!(state.user?.id && state.jwtTokens.token && state.jwtTokens.refresh_token)
);
export const UserSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.user
);
export const UserCentresSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.user?.centres
);
export const UserCurrentCentreSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.currentCentre
);

export const UserErrorSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.errors
);

export const ModulesSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.modules
);

export const MenusSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.menus
);
export const JwtTokensSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.jwtTokens
);
export const RefreshTokenInProgressSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.refreshTokenInProgress
);
export const AccessPermissionsSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.accessPermissions
);
export const ForgotPasswordSuccessMessageSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.forgotPasswordSuccessMessage
);
export const UnattachedControllersSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.unattachedControllers
);
export const RetryTimerSelector = (login: string) =>
  createSelector(selectAuth, (state: AuthState) =>
    state.resetPasswordRetryTimer.find(
      (element: PasswordRetryTimer) => element.login === login
    )
  );
export const SessionIDSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.sessionId
);
export const MenuFavorisSelector = createSelector(
  selectAuth,
  (state: AuthState) => state.menuFavoris
);
