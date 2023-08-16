import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as authActions from './auth.actions';
import { AppState } from '../app.state';
import { AuthService } from '../../auth/auth.service';
import { Params, Router } from '@angular/router';
import * as authSelectors from './auth.selectors';
import {
  ICurrentUser,
  IWsError,
  WsErrorClass,
  IRefreshTokenResponse,
  IJwtTokens,
  IModule,
  IControleur,
  ICentre,
  ChildrenItems,
} from '@app/models';
import {
  switchMap,
  map,
  catchError,
  withLatestFrom,
  tap,
  finalize,
  filter,
} from 'rxjs/operators';
import { GestionModulesService, MenuItemsService } from '@app/services';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { LocalStorageService } from '../../storage/localStorage.service';
import { LOCAL_STORAGE_KEYS } from '@app/config';
import * as routerSelector from '../router/router.selector';
import { TranslateService } from '@ngx-translate/core';
import { AuthState } from './auth.reducer';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { IRouterStateUrl } from '../router/router.state';
import { ToastrService } from 'ngx-toastr';
import { PermissionType } from '@app/enums';
import { UsersService } from '../../../features/settings/users/services/users.service';
import { InitializeWebsocketState } from '../websocket/websocket.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router,
    private modulesService: GestionModulesService,
    private menuItemsService: MenuItemsService,
    private translateService: TranslateService,
    private toaster: ToastrService,
    private gestionModulesService: GestionModulesService,
    private usersService: UsersService
  ) {}

  LoginEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.Login),
      switchMap((data) =>
        this.authService.login(data.request).pipe(
          map((jwtTokens: IJwtTokens) => {
            this.store.dispatch(authActions.LoginSuccess({ jwtTokens }));
            return authActions.GetCurrentUser();
          }),
          catchError((error: HttpErrorResponse) => {
            const iWsError: IWsError = new WsErrorClass(error);
            return of(
              authActions.LoginError({
                errors: {
                  ...iWsError,
                  messageToShow: this.translateService.instant(
                    'authentication.loginError'
                  ),
                },
              })
            );
          })
        )
      )
    )
  );

  SaveAuthStateEffect = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(authActions.SaveAuthState),
        withLatestFrom(this.store.pipe(select(authSelectors.selectAuth))),
        tap(([, authStore]: [any, AuthState]) =>
          LocalStorageService.setItem(LOCAL_STORAGE_KEYS.auth, authStore)
        )
      );
    },
    { dispatch: false }
  );

  GetCurrentUserModulesEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.GetCurrentUserModules),
      withLatestFrom(
        this.store.pipe(select(routerSelector.RouterSelector)),
        this.store.pipe(select(authSelectors.UserSelector))
      ),
      switchMap(
        ([, routerState, currentUser]: [any, IRouterStateUrl, ICurrentUser]) =>
          this.authService.getCurrentUserModules().pipe(
            map((modules: IModule[]) => {
              const menuFavoris: ChildrenItems[] = currentUser?.menu_favoris
                ? JSON.parse(currentUser?.menu_favoris)
                : [];
              this.store.dispatch(
                authActions.GetCurrentUserModulesSucess({
                  modules,
                  menus: this.menuItemsService.getMenuitem(modules),
                  menuFavoris:
                    this.menuItemsService.checkFavoriteItemPermission(
                      menuFavoris,
                      modules
                    ),
                })
              );
              this.store.dispatch(authActions.SaveAuthState());
              return authActions.GethUnattachedControllers();
            }),
            tap(() => {
              if (routerState.url.split('?')[0] !== '/login') {
                return;
              }
              if (Object.keys(routerState.queryParams).length === 0) {
                this.router.navigate(['/p']);
              } else {
                this.router.navigate([routerState.queryParams.redirectUrl]);
              }
            }),
            catchError((error: HttpErrorResponse) => {
              const iWsError: IWsError = new WsErrorClass(error);
              this.store.dispatch(authActions.InitializeAuthState());
              LocalStorageService.removeItem(LOCAL_STORAGE_KEYS.auth);
              LocalStorageService.removeItem(LOCAL_STORAGE_KEYS.webSocket);
              return of(
                authActions.GetCurrentUserModulesError({
                  errors: {
                    ...iWsError,
                    messageToShow: this.translateService.instant(
                      'authentication.getCurrentUserModulesError'
                    ),
                  },
                })
              );
            })
          )
      )
    )
  );

  LogoutEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.Logout),
      withLatestFrom(this.store.pipe(select(routerSelector.RouterUrlSelector))),
      map(([action, url]: [any, string]) => {
        LocalStorageService.removeItem(LOCAL_STORAGE_KEYS.auth);
        LocalStorageService.removeItem(LOCAL_STORAGE_KEYS.webSocket);
        if (!action?.redirect) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/login'], {
            queryParams: { redirectUrl: url },
          });
        }
        this.store.dispatch(InitializeWebsocketState());
        return authActions.InitializeAuthState();
      })
    )
  );

  RefreshTokenEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.RefreshToken),
      withLatestFrom(this.store.pipe(select(authSelectors.JwtTokensSelector))),
      tap(() =>
        this.store.dispatch(
          authActions.SetRefreshTokenInProgress({
            refreshTokenInProgress: true,
          })
        )
      ),
      switchMap(([_, jwtTokens]: [any, IJwtTokens]) =>
        this.authService.refreshToken(jwtTokens.refresh_token).pipe(
          map((tokens: IRefreshTokenResponse) =>
            authActions.RefreshTokenSuccess({
              ...tokens,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(authActions.Logout({ redirect: true }));
            return of(
              authActions.RefreshTokenError({
                errors: {
                  ...new WsErrorClass(error),
                  messageToShow: this.translateService.instant(
                    'authentication.refreshTokenError'
                  ),
                },
              })
            );
          }),
          finalize(() => {
            this.store.dispatch(
              authActions.SetRefreshTokenInProgress({
                refreshTokenInProgress: false,
              })
            );
          })
        )
      )
    )
  );

  GetCurrentUserEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.GetCurrentUser),
      withLatestFrom(
        this.store.select(authSelectors.UserCurrentCentreSelector)
      ),
      switchMap(([_, currentCenter]: [any, ICentre]) =>
        this.authService.getMe().pipe(
          map((user: ICurrentUser) => {
            const defaultCentre = currentCenter?.id
              ? currentCenter
              : user.centres.length > 0
              ? user.centres[0]
              : null;
            const centres = user.centres.sort((a, b) => {
              return a.id < b.id ? -1 : 1;
            });
            this.store.dispatch(
              authActions.GetCurrentUserSuccess({
                user: { ...user, centres },
                currentCentre: defaultCentre,
              })
            );
            return authActions.GetCurrentUserModules();
          }),
          catchError((error: HttpErrorResponse) => {
            return of(
              authActions.GetCurrentUserError({
                errors: {
                  ...new WsErrorClass(error),
                  messageToShow: this.translateService.instant(
                    'authentication.getCurrentUserError'
                  ),
                },
              })
            );
          })
        )
      )
    )
  );

  ForgotPasswordEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.ForgotPassword),
      switchMap((action) =>
        this.authService.forgotPassword(action.login).pipe(
          map(() => {
            return authActions.ForgotPasswordSuccessMessage({
              forgotPasswordSuccessMessage: this.translateService.instant(
                'authentication.forgotPasswordSuccess'
              ),
            });
          }),
          catchError((error: HttpErrorResponse) => {
            const retryAfterHeader = error.headers.get('Retry-After');
            const duration = retryAfterHeader
              ? parseInt(retryAfterHeader, 10)
              : null;
            if (error.status === 429 && duration) {
              this.store.dispatch(
                authActions.StartRetryTimer({ login: action.login, duration })
              );
              return of(authActions.SaveAuthState());
            } else {
              return of(
                authActions.ForgotResetPasswordError({
                  errors: {
                    ...new WsErrorClass(error),
                    messageToShow: this.translateService.instant(
                      'authentication.forgotResetPasswordError'
                    ),
                  },
                })
              );
            }
          })
        )
      )
    )
  );
  ResetPasswordEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.ResetPassword),
      switchMap((action) =>
        this.authService.resetPassword(action.request).pipe(
          map(() => {
            this.toaster.success(
              this.translateService.instant(
                'authentication.resetPasswordSuccess'
              )
            );
            this.router.navigate(['/login']);
            return authActions.ResetPasswordSuccess();
          }),
          catchError((error: HttpErrorResponse) => {
            return of(
              authActions.ForgotResetPasswordError({
                errors: {
                  ...new WsErrorClass(error),
                  messageToShow: this.translateService.instant(
                    'authentication.forgotResetPasswordError'
                  ),
                },
              })
            );
          })
        )
      )
    )
  );
  CheckResetPasswordTokenEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.CheckResetPasswordToken),
        switchMap((action) =>
          this.authService.checkResetPasswordToken(action.token).pipe(
            catchError((error: HttpErrorResponse) => {
              this.store.dispatch(
                authActions.ForgotResetPasswordError({
                  errors: {
                    ...new WsErrorClass(error),
                    messageToShow: this.translateService.instant(
                      _('authentication.checkResetPasswordTokenError')
                    ),
                  },
                })
              );
              return of(null).pipe(
                tap(() => this.router.navigate(['/forgot']))
              );
            })
          )
        )
      ),
    { dispatch: false }
  );

  SsoAuthenticationEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.SsoAuthentication),
      withLatestFrom(
        this.store.pipe(select(routerSelector.RouterParamsSelector))
      ),
      switchMap(([, params]: [any, Params]) =>
        this.authService.getRefreshToken(params?.token).pipe(
          map((data: { refresh_token: string }) => {
            this.store.dispatch(
              authActions.SsoAuthenticationSuccess({
                token: params.token,
                refresh_token: data.refresh_token,
              })
            );
            return authActions.GetCurrentUser();
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(authActions.Logout({ redirect: false }));
            return of(
              authActions.SsoAuthenticationError({
                errors: {
                  ...new WsErrorClass(error),
                  messageToShow: this.translateService.instant(
                    'authentication.SsoAuthenticationError'
                  ),
                },
              })
            );
          })
        )
      )
    )
  );

  GethUnattachedControllersxEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.GethUnattachedControllers),
      switchMap(() =>
        this.gestionModulesService
          .findPermissionsByUrl('p/settings/users')
          .pipe(
            filter((permissions: PermissionType[]) =>
              permissions.includes(PermissionType.WRITE)
            ),
            switchMap(() =>
              this.authService
                .getControleurs({ utilisateur_id_null: true, actif: 1 })
                .pipe(
                  map((unattachedControllers: IControleur[]) =>
                    authActions.GethUnattachedControllersSucess({
                      unattachedControllers,
                    })
                  ),
                  catchError((error: HttpErrorResponse) => {
                    const iWsError: IWsError = new WsErrorClass(error);
                    return of(
                      authActions.GetUnattachedControllersError({
                        unattachedControllers: [],
                        errors: {
                          ...iWsError,
                          messageToShow: this.translateService.instant(
                            'authentication.getUnattachedControllersError'
                          ),
                        },
                      })
                    );
                  })
                )
            )
          )
      )
    )
  );

  UpdateMenuFavorisEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.UpdateMenuFavoris),
      withLatestFrom(this.store.pipe(select(authSelectors.UserSelector))),
      switchMap(([action, user]: [any, ICurrentUser]) =>
        this.usersService
          .updateUser(user.id, {
            menu_favoris: JSON.stringify(action.menuFavoris),
          })
          .pipe(
            map(() => {
              this.toaster.success(
                this.translateService.instant(
                  'userMenu.UpdateMenuFavorisSuccess'
                )
              );
              return authActions.UpdateMenuFavorisSuccess({
                menuFavoris: action.menuFavoris,
              });
            }),
            catchError((error: HttpErrorResponse) => {
              return of(
                authActions.UpdateMenuFavorisError({
                  errors: {
                    ...new WsErrorClass(error),
                    messageToShow: this.translateService.instant(
                      'userMenu.UpdateMenuFavorisError'
                    ),
                  },
                })
              );
            })
          )
      )
    )
  );
}
