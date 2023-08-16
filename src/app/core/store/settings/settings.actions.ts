import { createAction, props } from '@ngrx/store';
import { IBandeauInformation, IWsError } from '@app/models';

export const StartLoadingAction = createAction('[Settings] Start Loading');

export const StopLoadingAction = createAction('[Settings] Stop Loading');

export const StartLoadingHttpAction = createAction(
  '[Settings] Start Loading HTTP'
);

export const StopLoadingHttpAction = createAction(
  '[Settings] Stop Loading HTTP'
);

export const SetLanguageAction = createAction(
  '[Settings] Set Language',
  props<{ language: string }>()
);

export const SetLogoAction = createAction(
  '[Settings] Set logo',
  props<{ logo: string }>()
);

export const SetThemeAction = createAction(
  '[Settings] Set Theme',
  props<{ theme: string }>()
);

export const GetBandeauInformations = createAction(
  '[ Settings ] - Get bandeau informations'
);

export const GetBandeauInformationsSuccess = createAction(
  '[ Settings ] - Get bandeau informations Success',
  props<{ bandeauInformations: IBandeauInformation[] }>()
);

export const GetBandeauInformationsError = createAction(
  '[ Settings ] - Get bandeau informations Error',
  props<{ error: IWsError; bandeauInformations: IBandeauInformation[] }>()
);
