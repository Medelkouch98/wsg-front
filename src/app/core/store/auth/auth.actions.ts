import { createAction, props } from '@ngrx/store';
import {
  IWsError,
  Menu,
  ICentre,
  ILoginRequest,
  ICurrentUser,
  IJwtTokens,
  IModule,
  IControleur,
  ChildrenItems,
} from '@app/models';
import { IResetPasswordConfirmRequest } from '../../auth/models/reset-password-confirm-request.model';
import { PermissionType } from '@app/enums';

export const Login = createAction(
  '[Auth] Login',
  props<{ request: ILoginRequest }>()
);
export const LoginSuccess = createAction(
  '[Auth] Login Success',
  props<{ jwtTokens: IJwtTokens }>()
);
export const LoginError = createAction(
  '[Auth] Login Error',
  props<{ errors: IWsError }>()
);
export const SaveAuthState = createAction(
  '[Auth] Save AuthState into LocalStorage'
);
export const Logout = createAction(
  '[Auth] Logout',
  props<{ redirect?: boolean }>()
);
export const InitializeAuthState = createAction('[Auth] Initialize Auth State');

export const UpdateCurrentCentre = createAction(
  '[Auth] Update Current Centre',
  props<{ currentCentre: ICentre }>()
);
export const SetRefreshTokenInProgress = createAction(
  '[Auth] Set RefreshToken In Progress',
  props<{ refreshTokenInProgress: boolean }>()
);
export const RefreshToken = createAction('[Auth] RefreshToken');
export const RefreshTokenSuccess = createAction(
  '[Auth] RefreshToken Success',
  props<{ token: string; refresh_token: string }>()
);
export const RefreshTokenError = createAction(
  '[Auth] RefreshToken Error',
  props<{ errors: IWsError }>()
);
export const GetCurrentUser = createAction('[Auth] Get Current User');
export const GetCurrentUserSuccess = createAction(
  '[Auth] Get Current User Success',
  props<{
    user: ICurrentUser;
    currentCentre: ICentre;
  }>()
);
export const GetCurrentUserError = createAction(
  '[Auth] Get Current User Error',
  props<{ errors: IWsError }>()
);
export const ForgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ login: string }>()
);
export const ForgotResetPasswordError = createAction(
  '[Auth] Forgot Reset Password Error',
  props<{ errors: IWsError }>()
);
export const ResetPassword = createAction(
  '[Auth] Reset Password',
  props<{ request: IResetPasswordConfirmRequest }>()
);
export const ResetPasswordSuccess = createAction(
  '[Auth] Reset Password Success'
);
export const CheckResetPasswordToken = createAction(
  '[Auth] Check Reset Password Token',
  props<{ token: string }>()
);
export const SsoAuthentication = createAction('[Auth] Sso Authentication');
export const SsoAuthenticationSuccess = createAction(
  '[Auth] Sso Authentication Success',
  props<{ token: string; refresh_token: string }>()
);
export const SsoAuthenticationError = createAction(
  '[Auth] Sso Authentication Error',
  props<{ errors: IWsError }>()
);
export const SetAccessPermissions = createAction(
  '[Auth] Set Access Permissions ',
  props<{ accessPermissions: PermissionType[] }>()
);
export const ForgotPasswordSuccessMessage = createAction(
  '[Auth] Forgot Password Success Message',
  props<{ forgotPasswordSuccessMessage: string }>()
);
export const ResetError = createAction('[Auth] Reset Error');
export const GetCurrentUserModules = createAction(
  '[Auth] Get CurrentUser Modules'
);
export const GetCurrentUserModulesSucess = createAction(
  '[Auth] Get CurrentUser Modules Success',
  props<{
    modules: IModule[];
    menus: Menu[];
    menuFavoris: ChildrenItems[];
  }>()
);
export const GetCurrentUserModulesError = createAction(
  '[Auth] Get CurrentUser Modules Error',
  props<{ errors: IWsError }>()
);
export const GethUnattachedControllers = createAction(
  '[Auth] Get Unattached Controllers'
);
export const GethUnattachedControllersSucess = createAction(
  '[Auth] Get Unattached Controllers Success',
  props<{ unattachedControllers: IControleur[] }>()
);
export const GetUnattachedControllersError = createAction(
  '[Auth] Get Unattached Controllers Error',
  props<{ unattachedControllers: IControleur[]; errors: IWsError }>()
);
export const UpdateMenuFavoris = createAction(
  '[Auth] Update  Menu Favoris',
  props<{ menuFavoris: ChildrenItems[] }>()
);
export const UpdateMenuFavorisSuccess = createAction(
  '[Auth] Update  Menu Favoris Success',
  props<{ menuFavoris: ChildrenItems[] }>()
);
export const UpdateMenuFavorisError = createAction(
  '[Auth] Update  Menu Favoris Error',
  props<{ errors: IWsError }>()
);
export const StartRetryTimer = createAction(
  '[Auth] Start Retry Timer',
  props<{ duration: number; login: string }>()
);

export const StopRetryTimer = createAction(
  '[Auth] Stop Retry Timer',
  props<{ login: string }>()
);
export const SetSessionID = createAction(
  '[Auth] Set Session ID',
  props<{ sessionId: string }>()
);
