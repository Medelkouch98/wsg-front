import { Pipe, PipeTransform } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Pipe({ name: 'getElementFromResource', standalone: true })
export class GetElementFromResourcePipe implements PipeTransform {
  constructor(private store: Store<AppState>) {}

  /**
   * get a row from selector
   * Takes selector, value and key that defaults to id
   * Usage:
   *   selector | getElementFromResource: element.mode_reglement_id
   *   OR
   *   selector | getElementFromResource: element.code_regelement : 'code'
   * Example:
   *  {{ modesReglementsSelector| getElementFromResource : element.type_reglement }}
   * @param selector
   * @param value string | number
   * @param key string
   */
  transform(
    selector: (state: any) => any,
    value: string | number,
    key: string = 'id'
  ): Observable<any> {
    return this.store.pipe(
      select(selector),
      filter((rows) => !!rows),
      map((rows) => rows.find((row: any) => row[key] === value))
    );
  }
}
