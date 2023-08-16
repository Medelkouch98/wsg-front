import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ResourcesState } from './resources.reducer';
import {
  ICivilite,
  IEnergie,
  IModeReglement,
  IPrestation,
  IRole,
  ITva,
} from '@app/models';

export const ResourcesSelector =
  createFeatureSelector<ResourcesState>('resources');
export const ModesReglementsSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.modesReglements
);
export const TypesControleSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.typesControles
);
export const CategoriesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.categories
);
export const EnergiesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) =>
    state.energies?.filter((row: IEnergie) => row.code && row.libelle)
);
export const CivilitesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.civilites
);

export const CiviliteByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.civilites?.find((civilite: ICivilite) => civilite.id === id)
  );

export const CiviliteByTypeAndStateSelector = (
  type: number = null,
  actif: boolean = true
) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.civilites
      ?.filter((civilite: ICivilite) =>
        type !== null
          ? civilite.type === type &&
            (actif !== null ? civilite.actif === actif : true)
          : actif !== null
          ? civilite.actif === actif
          : true
      )
      .sort((c1, c2) => c1.type - c2.type)
  );

export const InactifCivilityByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.civilites?.find(
      (civilite: ICivilite) => !civilite.actif && civilite.id === id
    )
  );

export const EcheancesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.echeances
);

export const PrestationsSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.prestations
);
export const PrestationByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.prestations?.find((prestation: IPrestation) => prestation.id === id)
  );

export const ModesReglementsNegocieSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) =>
    state.modesReglements?.filter(
      (modeReglement: IModeReglement) => modeReglement.defaut
    )
);
export const ModesReglementsNegocieByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.modesReglements?.find(
      (modeReglement: IModeReglement) => modeReglement.id === id
    )
  );
export const TVAsSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.tvas
);
export const TVAByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.tvas?.find((tva: ITva) => tva.id === id)
  );

export const MarquesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.marques
);
export const ModelesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.modeles
);

export const CalledRessourcesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.calledRessources
);

export const FamillesITSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.famillesIT
);

export const RolesSelector = createSelector(
  ResourcesSelector,
  (state: ResourcesState) => state.roles
);

export const RoleByIdSelector = (id: number) =>
  createSelector(ResourcesSelector, (state: ResourcesState) =>
    state.roles?.find((role: IRole) => role.id === id)
  );
