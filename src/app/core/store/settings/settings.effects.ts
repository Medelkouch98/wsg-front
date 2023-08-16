import { INIT, select, Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as featureActions from './settings.actions';
import * as settingsActions from './settings.actions';
import * as featureSelectors from './settings.selectors';
import { selectSettings } from './settings.selectors';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { LocalStorageService } from '../../storage/localStorage.service';
import { LOCAL_STORAGE_KEYS } from '@app/config';
import { merge, of } from 'rxjs';
import { RouterUrlSelector } from '../router/router.selector';
import { IBandeauInformation, IWsError, WsErrorClass } from '@app/models';
import { HttpErrorResponse } from '@angular/common/http';
import { BandeauInformationService } from '@app/services';

@Injectable()
export class SettingsEffects {
  constructor(
    private actions$: Actions,
    public store: Store<AppState>,
    private overlayContainer: OverlayContainer,
    private bandeauInformationService: BandeauInformationService,
    private translateService: TranslateService
  ) {}

  persistSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(featureActions.SetLanguageAction),
        withLatestFrom(this.store.pipe(select(selectSettings))),
        tap(([, settings]) =>
          LocalStorageService.setItem(LOCAL_STORAGE_KEYS.settings, settings)
        )
      ),
    { dispatch: false }
  );
  setTranslateServiceLanguage$ = createEffect(
    () =>
      this.store.pipe(
        select(featureSelectors.SettingsLanguageSelector),
        distinctUntilChanged(),
        tap((language) => this.translateService.use(language))
      ),
    { dispatch: false }
  );

  setThemeEffect = createEffect(
    () =>
      merge(
        INIT,
        this.actions$.pipe(ofType(featureActions.SetThemeAction))
      ).pipe(
        withLatestFrom(
          this.store.pipe(select(featureSelectors.ThemeSettingsSelector))
        ),
        tap(([, theme]) => {
          const classList =
            this.overlayContainer.getContainerElement().classList;
          const toRemove = Array.from(classList).filter((item: string) =>
            item.includes('-theme')
          );
          if (toRemove.length) {
            classList.remove(...toRemove);
          }
          classList.add(theme);
        })
      ),
    { dispatch: false }
  );

  setLogoEffect$ = createEffect(() =>
    this.store.pipe(
      select(RouterUrlSelector),
      map(() => {
        switch (window.location.hostname) {
          case 'www.autosur.com':
            return settingsActions.SetLogoAction({
              logo: 'autosur-logo',
            });
          case 'www.technosur.com':
            return settingsActions.SetLogoAction({
              logo: 'technosur-logo',
            });
          case 'www.diagnosur.com':
            return settingsActions.SetLogoAction({
              logo: 'diagnosur-logo',
            });
          default:
            return settingsActions.SetLogoAction({
              logo: 'autosur-logo',
            });
        }
      })
    )
  );

  GetBandeauInformationsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(featureActions.GetBandeauInformations),
      switchMap(() =>
        this.bandeauInformationService.getBandeauInformation().pipe(
          map((bandeauInformations: IBandeauInformation[]) => {
            return featureActions.GetBandeauInformationsSuccess({
              bandeauInformations,
            });
          }),
          catchError((httpError: HttpErrorResponse) => {
            const error: IWsError = new WsErrorClass(httpError);
            error.messageToShow = this.translateService.instant(
              'error.getBandeauInformationError'
            );
            return of(
              featureActions.GetBandeauInformationsError({
                error,
                bandeauInformations: [],
              })
            );
          })
        )
      )
    )
  );
}
