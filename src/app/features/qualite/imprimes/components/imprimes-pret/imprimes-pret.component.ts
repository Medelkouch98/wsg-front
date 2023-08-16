import { Component } from '@angular/core';
import { ImprimesTypeFormEnum } from '../../enum';
import { ImprimesFormComponent } from '../imprimes-form/imprimes-form.component';

@Component({
  selector: 'app-imprimes-pret',
  standalone: true,
  imports: [ImprimesFormComponent],
  template: `
    <app-imprimes-form
      [imprimesTypeForm]="ImprimesTypeFormEnum.pret"
    ></app-imprimes-form>
  `,
})
export class ImprimesPretComponent {
  ImprimesTypeFormEnum = ImprimesTypeFormEnum;
}
