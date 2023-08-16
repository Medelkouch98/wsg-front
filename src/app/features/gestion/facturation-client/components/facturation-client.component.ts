import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FacturationClientStore } from '../facturation-client.store';
import { FacturationClientProService } from '../services/facturation-client-pro.service';

@Component({
  selector: 'app-facturation-client-pro',
  standalone: true,
  imports: [RouterOutlet],
  providers: [FacturationClientStore, FacturationClientProService],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class FacturationClientComponent {}
