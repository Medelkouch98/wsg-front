import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialEventAddSelectionComponent } from '../material-add-event-selection/material-event-add-selection.component';
import { MaterialStore } from '../../../material.store';
import { Observable, map } from 'rxjs';
import { IMaterialDisplayCategory } from '../../../models';
import { filterSubTypesByEvenementType } from '../../../helpers/material.helper';

/**
 * Component for adding material maintenance contracts for a selection of materials.
 */
@Component({
  selector: 'app-material-maintenance-contrat',
  standalone: true,
  template: `
    <app-material-event-add-selection
      [eventId]="maintenaceContratEventId"
      [materials]="materials$ | async"
      eventLabel="qualite.material.contractSigningDate"
      [fileRequired]="true"
    />
  `,
  imports: [AsyncPipe, MaterialEventAddSelectionComponent],
})
export class MaterialMaintenaceContratComponent {
  private materialStore = inject(MaterialStore);

  /**
   * Materials display categories filtered based on the maintenance contrat event ID.
   */
  public materials$: Observable<IMaterialDisplayCategory[]> =
    this.materialStore.materials$.pipe(
      map((materials) =>
        filterSubTypesByEvenementType(materials, this.maintenaceContratEventId)
      )
    );

  public maintenaceContratEventId = 16;
}
