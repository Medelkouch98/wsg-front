import { Pipe, PipeTransform } from '@angular/core';
import { TarificationHelper } from '@app/helpers';
import { IPrestation } from '@app/models';
import { ITva } from '@app/models';

type Tax = 'TTC' | 'HT';

@Pipe({ name: 'remise', standalone: true })
export class RemisePipe implements PipeTransform {
  /**
   * Formater un nombre
   * @param tarification tarification
   * @param args type de tax, prestation et tva
   * @return number
   */
  transform(tarification: any, ...args: [Tax, IPrestation, ITva]): number {
    const [remiseType, prestation, tva] = args;
    switch (remiseType) {
      case 'TTC':
        return TarificationHelper.calculateTTCRemise(
          prestation,
          tarification.remise_euro,
          tarification.remise_pourcentage,
          tva
        );
      case 'HT':
        return TarificationHelper.calculateHTRemise(
          prestation,
          tarification.remise_euro,
          tarification.remise_pourcentage
        );
    }
  }
}
