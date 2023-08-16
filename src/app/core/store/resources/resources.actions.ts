import { createAction, props } from '@ngrx/store';
import {
  ICategorie,
  ICivilite,
  IEcheance,
  IEnergie,
  IFamilleIT,
  IMarque,
  IModele,
  IModeReglement,
  IRole,
  ITva,
  ITypeControle,
  IWsError,
} from '@app/models';
import { IPrestation } from 'app/shared/models/prestation.model';

export const GetModesReglement = createAction(
  '[ Resources ] - Get modes reglement'
);
export const GetModesReglementSuccess = createAction(
  '[ Resources ] - Get modes reglement success',
  props<{ modesReglements: IModeReglement[] }>()
);
export const GetModesReglementError = createAction(
  '[ Resources ] - Get modes reglement error',
  props<{ modesReglements?: IModeReglement[]; error: IWsError }>()
);

export const GetTypesControle = createAction(
  '[ Resources ] - Get types du controle'
);
export const GetTypesControleSuccess = createAction(
  '[ Resources ] - Get types du controle success',
  props<{ typesControles: ITypeControle[] }>()
);
export const GetTypesControleError = createAction(
  '[ Resources ] - Get types du controle error',
  props<{ typesControles?: ITypeControle[]; error: IWsError }>()
);
export const GetCategories = createAction('[ Resources ] - Get categorie');
export const GetCategoriesSuccess = createAction(
  '[ Resources ] - Get categorie success',
  props<{ categories: ICategorie[] }>()
);
export const GetCategoriesError = createAction(
  '[ Resources ] - Get categorie error',
  props<{ categories?: ICategorie[]; error: IWsError }>()
);
export const GetEnergie = createAction('[ Resources ] - Get energie');
export const GetEnergieSuccess = createAction(
  '[ Resources ] - Get energie success',
  props<{ energies: IEnergie[] }>()
);
export const GetEnergieError = createAction(
  '[ Resources ] - Get energie error',
  props<{ energies?: IEnergie[]; error: IWsError }>()
);

export const GetCivilites = createAction('[ Resources ] - Get civilites');
export const GetCivilitesSuccess = createAction(
  '[ Resources ] - Get civilites success',
  props<{ civilites: ICivilite[] }>()
);
export const GetCivilitesError = createAction(
  '[ Resources ] - Get civilites error',
  props<{ civilites?: ICivilite[]; error: IWsError }>()
);

export const GetEcheances = createAction('[ Resources ] - Get echeances');
export const GetEcheanceSuccess = createAction(
  '[ Resources ] - Get echeances success',
  props<{ echeances: IEcheance[] }>()
);
export const GetEcheanceError = createAction(
  '[ Resources ] - Get echeances error',
  props<{ echeances: IEcheance[]; error: IWsError }>()
);

export const GetPrestations = createAction('[ Resources ] - Get prestations');
export const GetPrestationsSuccess = createAction(
  '[ Resources ] - Get prestations success',
  props<{ prestations: IPrestation[] }>()
);
export const GetPrestationsError = createAction(
  '[ Resources ] - Get prestations error',
  props<{ prestations?: IPrestation[]; error: IWsError }>()
);
export const GetTVAs = createAction('[ Resources ] - Get Tvas');
export const GetTVAsSuccess = createAction(
  '[ Resources ] - Get Tvas success',
  props<{ tvas: ITva[] }>()
);
export const GetTVAsError = createAction(
  '[ Resources ] - Get Tvas error',
  props<{ tvas?: ITva[]; error: IWsError }>()
);

export const GetMarques = createAction('[ Resources ] - Get marques');
export const GetMarquesSuccess = createAction(
  '[ Resources ] - Get marques success',
  props<{ marques: IMarque[] }>()
);
export const GetMarquesError = createAction(
  '[ Resources ] - Get marques error',
  props<{ marques?: IMarque[]; error: IWsError }>()
);

export const SearchModeleByMarque = createAction(
  '[ Resources ] - Get modeles',
  props<{ marque: string }>()
);
export const SearchModeleByMarqueSuccess = createAction(
  '[ Resources ] - Get modeles success',
  props<{ modeles: IModele[] }>()
);
export const SearchModeleByMarqueError = createAction(
  '[ Resources ] - Get modeles error',
  props<{ modeles?: IModele[]; error: IWsError }>()
);
export const SetCalledRessources = createAction(
  '[ Resources ] - SetCalledRessources',
  props<{ ressource: string; value: boolean }>()
);

export const GetFamillesIT = createAction('[ Resources ] - Get Familles IT');
export const GetFamillesITSuccess = createAction(
  '[ Resources ] - Get Familles IT success',
  props<{ famillesIT: IFamilleIT[] }>()
);
export const GetFamillesITError = createAction(
  '[ Resources ] - Get Familles IT error',
  props<{ famillesIT?: IFamilleIT[]; error: IWsError }>()
);

export const GetRoles = createAction('[ Resources ] - Get Roles');
export const GetRolesSuccess = createAction(
  '[ Resources ] - Get Roles success',
  props<{ roles: IRole[] }>()
);
export const GetRolesError = createAction(
  '[ Resources ] - Get Roles error',
  props<{ roles?: IRole[]; error: IWsError }>()
);
