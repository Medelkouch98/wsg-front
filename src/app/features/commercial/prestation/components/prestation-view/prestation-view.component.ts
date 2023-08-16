import { Component } from '@angular/core';
import { PrestationStore } from '../../prestation.store';
import { PrestationFormComponent } from '../prestation-form/prestation-form.component';

@Component({
  selector: 'app-prestation-view',
  standalone: true,
  imports: [PrestationFormComponent],
  template: `
    <app-prestation-form [addMode]="false"></app-prestation-form>
  `,
})
export class PrestationViewComponent {
  constructor(private prestationStore: PrestationStore) {
    this.prestationStore.SetIsIdentificationValidated(false);
  }
}
