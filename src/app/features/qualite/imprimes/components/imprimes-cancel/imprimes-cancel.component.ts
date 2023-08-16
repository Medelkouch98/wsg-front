import { Component } from '@angular/core';
import { ImprimesFormComponent } from '../imprimes-form/imprimes-form.component';
import { ImprimesTypeFormEnum } from '../../enum';

@Component({
  selector: 'app-imprimes-cancel',
  standalone: true,
  imports: [ImprimesFormComponent],
  template: `
    <app-imprimes-form
      [imprimesTypeForm]="ImprimesTypeFormEnum.cancel"
    ></app-imprimes-form>
  `,
})
export class ImprimesCancelComponent {
  ImprimesTypeFormEnum = ImprimesTypeFormEnum;
}
