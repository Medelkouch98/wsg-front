import { Component } from '@angular/core';
import { PrestationStore } from '../../prestation.store';
import { PrestationFormComponent } from '../prestation-form/prestation-form.component';

@Component({
  selector: 'app-prestation-add',
  standalone: true,
  imports: [PrestationFormComponent],
  template: `
    <app-prestation-form [addMode]="true"></app-prestation-form>
  `,
})
export class PrestationAddComponent {
  constructor(private prestationStore: PrestationStore) {
    this.prestationStore.InitialisePrestation();
  }
}
