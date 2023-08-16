import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SuiviFactureStore } from '../suivi-facture.store';

@Component({
  selector: 'app-suivi-facture',
  standalone: true,
  imports: [RouterOutlet],
  providers: [SuiviFactureStore],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class SuiviFactureComponent {}
