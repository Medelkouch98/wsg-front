import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { MaterialStore } from '../material.store';

@Pipe({ name: 'subType', standalone: true })
export class SubTypePipe implements PipeTransform {
  private materialStore = inject(MaterialStore);

  /**
   * Transforms the sub-type ID into its corresponding label.
   * @param subTypeId The ID of the sub-type.
   * @returns An Observable string representing the sub-type label.
   */
  transform(subTypeId: number): Observable<string> {
    return this.materialStore.subTypes$.pipe(
      take(1),
      map((subTypes) => subTypes.find(({ id }) => subTypeId === id).libelle)
    );
  }
}
