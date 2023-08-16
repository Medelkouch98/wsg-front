import { Pipe, PipeTransform } from '@angular/core';
import { IDetailPrestation } from '@app/models';
import { isPrestaOb } from '@app/helpers';

@Pipe({ name: 'reotc', standalone: true })
export class ReotcPipe implements PipeTransform {
  /**
   * For prestations OB add redevance OTC
   * Takes prestation, value and key
   * Usage:
   *   prestation | reotc: element.montant_ht_net : 'montant_ht_net'
   * @param prestation prestation
   * @param value number
   * @param key string
   * @return number
   */
  transform(prestation: IDetailPrestation, value: number, key: string): number {
    if (!!isPrestaOb(prestation.code_prestation)) {
      // @ts-ignore
      value = value + prestation.reotc[key];
    }
    return value;
  }
}
