import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ICompteurItem,
  ICompteursSearchResponse,
  ICompteursStats,
  IJustificationsResponse,
  TypeCompteurAction,
} from '../models';
import { IActionsButton, IStatisticCardData } from '@app/models';
import {
  IOptionalDropDownDetails,
  OptionalDropDownDetails,
} from '../../../../shared/components/optional-dropdown/models';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { DirectionEnum, PermissionType } from '@app/enums';

@Injectable({ providedIn: 'root' })
export class CompteursHelper {
  constructor(private translateService: TranslateService) {}

  /**
   * transforme le retour du backend ICompteursStats en IStatisticCardData
   * @param {ICompteursStats} stats
   * @returns {IStatisticCardData[]}
   */
  public generateStatisticCardDataFromCompteursStats(
    stats: ICompteursStats
  ): IStatisticCardData[] {
    return [
      {
        id: 1,
        class: `${DANGER_LEVELS.get(1).background} cursor-pointer`,
        label: this.translateService.instant('qualite.compteurs.niveau', {
          niveau: 1,
        }),
        value: stats?.niveau1?.total,
        extras: [
          {
            icon: 'check',
            iconClass: 'text-green-400',
            label: 'qualite.compteurs.justified',
            value: stats?.niveau1?.justified,
          },
          {
            icon: 'timelapse',
            iconClass: 'text-red-600',
            label: 'qualite.compteurs.toBeJustified',
            value: stats?.niveau1?.unjustified,
          },
        ],
      },
      {
        id: 2,
        class: `${DANGER_LEVELS.get(2).background} cursor-pointer`,
        label: this.translateService.instant('qualite.compteurs.niveau', {
          niveau: 2,
        }),
        value: stats?.niveau2?.total,
        extras: [
          {
            icon: 'check',
            iconClass: 'text-green-400',
            label: 'qualite.compteurs.justified',
            value: stats?.niveau2?.justified,
          },
          {
            icon: 'timelapse',
            iconClass: 'text-red-600',
            label: 'qualite.compteurs.toBeJustified',
            value: stats?.niveau2?.unjustified,
          },
        ],
      },
      {
        id: 3,
        class: `${DANGER_LEVELS.get(3).background} cursor-pointer`,
        label: this.translateService.instant('qualite.compteurs.niveau', {
          niveau: 3,
        }),
        value: stats?.niveau3?.total,
        extras: [
          {
            icon: 'check',
            iconClass: 'text-green-400',
            label: 'qualite.compteurs.justified',
            value: stats?.niveau3?.justified,
          },
          {
            icon: 'timelapse',
            iconClass: 'text-red-600',
            label: 'qualite.compteurs.toBeJustified',
            value: stats?.niveau3?.unjustified,
          },
        ],
      },
      {
        id: 4,
        class: `${DANGER_LEVELS.get(4).background} cursor-pointer`,
        label: 'qualite.compteurs.unjustifiedAllYears',
        value: stats?.global?.unjustified,
        icon: 'timelapse',
      },
    ];
  }

  /**
   * transforme le retour du backend et regroupe les données par niveau, ensuite par compteur
   * @param {ICompteursSearchResponse} response
   * @returns {Record<number, Record<string, ICompteurItem[]>>}
   */
  public mapCompteursSearchResult(
    response: ICompteursSearchResponse
  ): Record<number, Record<string, ICompteurItem[]>> {
    return (response?.compteurs as any[])?.reduce(
      (accumulator, compteurItem: ICompteurItem) => {
        if (!accumulator[compteurItem.niveau]) {
          accumulator[compteurItem.niveau] = {};
        }
        if (!accumulator[compteurItem.niveau][compteurItem.code]) {
          accumulator[compteurItem.niveau][compteurItem.code] = [];
        }
        accumulator[compteurItem.niveau][compteurItem.code].push(compteurItem);
        return accumulator;
      },
      {}
    );
  }

  /**
   * récupération des actions correctives/preventives à partir de la justification,
   * on les map vers IOptionalDropDownDetails pour les passées au composant OptionalDropdownComponent
   * @param {IJustificationsResponse[]} justificationsResponses
   * @param {TypeCompteurAction} type
   * @param {number} idJustification
   * @return {IOptionalDropDownDetails[]}
   */
  public getActionAsOptionalDropDownDetails(
    justificationsResponses: IJustificationsResponse[],
    type: TypeCompteurAction,
    idJustification: number
  ): IOptionalDropDownDetails[] {
    return justificationsResponses
      .find(
        (justification: IJustificationsResponse) =>
          justification.id === idJustification
      )
      ?.compteur_actions?.filter((action) => action.type === type)
      .map(
        (action: IOptionalDropDownDetails) =>
          new OptionalDropDownDetails(action.id, action.libelle)
      );
  }

  /**
   * custom validator for year. the year is required if the month is selected
   */
  public yearValidator(): ValidatorFn {
    return (control: AbstractControl): null => {
      const month = control.get('month');
      const year = control.get('year');
      if (month?.value !== -1 && year?.value === -1) {
        year.setErrors({ required: true });
      } else {
        year?.setErrors(null);
      }
      return null;
    };
  }
}

//Les niveaux de gravité et leurs couleurs
export const DANGER_LEVELS: Map<
  number,
  { border: string; background: string }
> = new Map<number, { border: string; background: string }>([
  [1, { border: 'border-l-8 border-green-600', background: 'bg-green-600' }],
  [2, { border: 'border-l-8 border-amber-400', background: 'bg-amber-400' }],
  [3, { border: 'border-l-8 border-orange-500', background: 'bg-orange-500' }],
  [4, { border: 'border-l-8 border-red-600', background: 'bg-red-600' }],
]);

export const ImpressionCompteursPDFButton: IActionsButton = {
  libelle: 'qualite.compteurs.impressionCompteursPDF',
  direction: DirectionEnum.LEFT,
  icon: 'print',
  customColor: 'green',
  action: 'impressionCompteursPDF',
  permissions: [PermissionType.EXPORT],
};

export const FichierOTCButton: IActionsButton = {
  libelle: 'qualite.compteurs.fichierOTC',
  direction: DirectionEnum.LEFT,
  icon: 'print',
  customColor: 'green',
  action: 'fichierOTC',
  permissions: [PermissionType.EXPORT],
};
