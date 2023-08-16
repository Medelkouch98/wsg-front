import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState } from './settings.reducers';

export const selectSettings = createFeatureSelector<SettingsState>('settings');

export const LoadingSettingsSelector = createSelector(
  selectSettings,
  (settingSelector: SettingsState) => settingSelector.loading
);

export const LoadingHttpSettingsSelector = createSelector(
  selectSettings,
  (settingSelector: SettingsState) => settingSelector.loadingHttp
);
export const SettingsLanguageSelector = createSelector(
  selectSettings,
  (settingSelector: SettingsState) => settingSelector.language
);

export const LogoSettingsSelector = createSelector(
  selectSettings,
  (settingSelector: SettingsState) => settingSelector.logo
);

export const ThemeSettingsSelector = createSelector(
  selectSettings,
  (settings) => settings.theme
);

export const BackgroundsSelector = createSelector(
  selectSettings,
  (settings) => settings.backgrounds
);
export const BandeauInformationsSelector = createSelector(
  selectSettings,
  (selectSettings: SettingsState) => selectSettings.bandeauInformations
);
