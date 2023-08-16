import { ICompteurItem } from '../models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'compteurJustifie', standalone: true })
export class CompteurJustifiePipe implements PipeTransform {
  /**
   * retourner si le controle à au moins une justification
   * @param {ICompteurItem[]} compteurItems
   * @returns {boolean}
   */
  transform(compteurItems: ICompteurItem[]): boolean {
    return (
      (compteurItems as ICompteurItem[]).filter(
        (compteurItem) =>
          !!compteurItem.justification && compteurItem.justification !== ''
      ).length > 0
    );
  }
}
