import {
  CalledRessources,
  ICalledRessources,
  ICategorie,
  ICivilite,
  IEcheance,
  IEnergie,
  IFamilleIT,
  IMarque,
  IModele,
  IModeReglement,
  IPrestation,
  IRole,
  ITva,
  ITypeControle,
  IWsError,
} from '@app/models';
import { Action, createReducer, on } from '@ngrx/store';
import * as featureActions from './resources.actions';

export interface ResourcesState {
  modesReglements: IModeReglement[];
  typesControles: ITypeControle[];
  categories: ICategorie[];
  energies: IEnergie[];
  civilites: ICivilite[];
  prestations: IPrestation[];
  tvas: ITva[];
  echeances: IEcheance[];
  marques: IMarque[];
  modeles: IModele[];
  famillesIT: IFamilleIT[];
  roles: IRole[];
  errors?: IWsError;
  calledRessources: ICalledRessources;
}

export const initialResourcesState: ResourcesState = {
  modesReglements: [],
  typesControles: [],
  categories: [],
  energies: [],
  civilites: [],
  prestations: [],
  tvas: [],
  echeances: [],
  marques: [],
  modeles: [],
  famillesIT: [],
  roles: [],
  errors: null,
  calledRessources: new CalledRessources(),
};

const featureReducer = createReducer(
  initialResourcesState,
  on(
    featureActions.GetModesReglementSuccess,
    featureActions.GetModesReglementError,
    featureActions.GetTypesControleSuccess,
    featureActions.GetTypesControleError,
    featureActions.GetCategoriesSuccess,
    featureActions.GetCategoriesError,
    featureActions.GetEnergieSuccess,
    featureActions.GetEnergieError,
    featureActions.GetCivilitesSuccess,
    featureActions.GetCivilitesError,
    featureActions.GetPrestationsSuccess,
    featureActions.GetPrestationsError,
    featureActions.GetEcheanceSuccess,
    featureActions.GetEcheanceError,
    featureActions.GetMarquesSuccess,
    featureActions.GetMarquesError,
    featureActions.SearchModeleByMarqueSuccess,
    featureActions.SearchModeleByMarqueError,
    featureActions.GetTVAsSuccess,
    featureActions.GetTVAsError,
    featureActions.GetFamillesITSuccess,
    featureActions.GetFamillesITError,
    featureActions.GetRolesSuccess,
    featureActions.GetRolesError,
    (state, action) => ({
      ...state,
      ...action,
    })
  ),
  on(featureActions.SetCalledRessources, (state, action) => ({
    ...state,
    calledRessources: {
      ...state.calledRessources,
      [action.ressource]: action.value,
    },
  }))
);

export function resourcesReducer(
  state: ResourcesState | undefined,
  action: Action
): ResourcesState {
  return featureReducer(state, action);
}
