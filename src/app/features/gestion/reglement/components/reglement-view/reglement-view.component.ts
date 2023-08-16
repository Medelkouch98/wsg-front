import { Component } from '@angular/core';
import { ReglementFormComponent } from '../reglement-form/reglement-form.component';

@Component({
  selector: 'app-reglement-view',
  standalone: true,
  imports: [ReglementFormComponent],
  template: `
    <app-reglement-form [addMode]="false"></app-reglement-form>
  `,
})
export class ReglementViewComponent {
  constructor() {}
}
