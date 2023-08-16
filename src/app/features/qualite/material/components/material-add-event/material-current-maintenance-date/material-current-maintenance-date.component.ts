import { Component, inject } from '@angular/core';
import { MaterialEventAddSelectionComponent } from '../material-add-event-selection/material-event-add-selection.component';
import { Observable, map } from 'rxjs';
import { IMaterialDisplayCategory } from '../../../models';
import { MaterialStore } from '../../../material.store';
import { AsyncPipe } from '@angular/common';
import { filterSubTypesByEvenementType } from '../../../helpers/material.helper';

/**
 * Component for adding the current maintenance date for a selection of materials.
 */
@Component({
  selector: 'app-material-current-maintenance-date',
  standalone: true,
  template: `
    <app-material-event-add-selection
      [eventId]="currentMaintenanceDateEventId"
      [materials]="materials$ | async"
      eventLabel="qualite.material.currentMaintenanceDate"
      [fileRequired]="false"
    />
  `,
  imports: [AsyncPipe, MaterialEventAddSelectionComponent],
})
export class MaterialCurrentMaintenanceDateComponent {
  private materialStore = inject(MaterialStore);

  /**
   * Materials display categories filtered based on the current maintenance date event ID.
   */
  public materials$: Observable<IMaterialDisplayCategory[]> =
    this.materialStore.materials$.pipe(
      map((materials) =>
        filterSubTypesByEvenementType(
          materials,
          this.currentMaintenanceDateEventId
        )
      )
    );

  public currentMaintenanceDateEventId = 7;
}
