import { Pipe, PipeTransform } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { Observable } from 'rxjs';
import * as resourcesSelector from '../../core/store/resources/resources.selector';
import { ICivilite } from '../models';

@Pipe({ name: 'civilite', standalone: true })
export class CivilitePipe implements PipeTransform {
  constructor(private store: Store<AppState>) {}
  /**
   * Récupérer civilite actif ou inactif par id
   * @param id number
   * @param args boolean
   * @return Observable<ICivilite>
   */
  transform(id: number, ...args: [number]): Observable<ICivilite> {
    const [civilite_id_inactif] = args;
    return civilite_id_inactif
      ? this.store.pipe(
          select(
            resourcesSelector.InactifCivilityByIdSelector(civilite_id_inactif)
          )
        )
      : this.store.pipe(select(resourcesSelector.CiviliteByIdSelector(id)));
  }
}
