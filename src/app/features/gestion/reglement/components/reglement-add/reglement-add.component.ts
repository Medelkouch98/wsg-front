import { Component } from '@angular/core';
import { ReglementFormComponent } from '../reglement-form/reglement-form.component';
import { ReglementStore } from '../../reglement.store';

@Component({
  selector: 'app-reglement-add',
  standalone: true,
  imports: [ReglementFormComponent],
  template: `
    <app-reglement-form [addMode]="true"></app-reglement-form>
  `,
})
export class ReglementAddComponent {
  constructor(private reglementStore: ReglementStore) {
    this.reglementStore.initialiseReglement();
  }
}
