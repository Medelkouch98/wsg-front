import { Component } from '@angular/core';
import { ReglementStore } from '../reglement.store';
import { ReglementService } from '../services/reglement.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reglement',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ReglementStore, ReglementService],
})
export class ReglementComponent {}
