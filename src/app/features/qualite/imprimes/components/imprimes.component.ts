import { Component } from '@angular/core';
import { ImprimesStore } from '../imprimes.store';
import { RouterOutlet } from '@angular/router';
import { ImprimesService } from '../services/imprimes.service';

@Component({
  selector: 'app-imprimes',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ImprimesStore, ImprimesService],
})
export class ImprimesComponent {
  constructor() {}
}
