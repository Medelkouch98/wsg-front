import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { MaterialStore } from '../material.store';
import { IMaterialEventType } from '../models';

@Pipe({ name: 'eventType', standalone: true })
export class EventTypePipe implements PipeTransform {
  private materialStore = inject(MaterialStore);

  /**
   * Transforms the event type ID into its corresponding label.
   * @param eventTypeId The ID of the event type.
   * @returns An Observable string representing the event type label.
   */
  transform(eventTypeId: number): Observable<string> {
    return this.materialStore.eventTypes$.pipe(
      take(1),
      map(
        (eventTypes: IMaterialEventType[]) =>
          eventTypes.find(({ id }) => eventTypeId === id).libelle
      )
    );
  }
}
