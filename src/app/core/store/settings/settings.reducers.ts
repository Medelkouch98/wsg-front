import { Action, createReducer, on } from '@ngrx/store';
import * as featureActions from './settings.actions';
import { IBandeauInformation, IWsError } from '@app/models';
import { environment } from '../../../../environments/environment';

export const LOGO = 'autosur-logo-transparent';
export const WS_THEME = 'default';

export interface SettingsState {
  language: string;
  loading: boolean;
  loadingHttp: boolean;
  theme: string;
  logo: string;
  backgrounds: string[];
  bandeauInformations: IBandeauInformation[];
  error: IWsError | null;
}

export const initialResourcesState: SettingsState = {
  language: environment.defaultLanguage,
  loading: false,
  loadingHttp: true,
  theme: WS_THEME,
  logo: `../../../assets/images/${LOGO}.png`,
  backgrounds: [
    'assets/images/background/login-bg-autosur01.jpg',
    'assets/images/background/login-bg-autosur02.jpg',
  ],
  bandeauInformations: [],
  error: null,
};

const featureReducer = createReducer(
  initialResourcesState,
  on(featureActions.StartLoadingAction, (state) => ({
    ...state,
    loading: true,
  })),
  on(featureActions.StopLoadingAction, (state) => ({
    ...state,
    loading: false,
  })),
  on(featureActions.StartLoadingHttpAction, (state) => ({
    ...state,
    loadingHttp: true,
  })),
  on(featureActions.StopLoadingHttpAction, (state) => ({
    ...state,
    loadingHttp: false,
  })),
  on(featureActions.SetLogoAction, (state, action) => ({
    ...state,
    logo: `../../../assets/images/${action.logo}.png`,
  })),
  on(
    featureActions.SetLanguageAction,
    featureActions.SetThemeAction,
    featureActions.GetBandeauInformationsSuccess,
    featureActions.GetBandeauInformationsError,
    (state, action) => ({
      ...state,
      ...action,
    })
  )
);

export function settingsReducer(
  state: SettingsState | undefined,
  action: Action
): SettingsState {
  return featureReducer(state, action);
}
