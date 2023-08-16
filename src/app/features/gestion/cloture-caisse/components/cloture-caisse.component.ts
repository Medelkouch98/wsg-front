import { Component } from '@angular/core';
import { ClotureCaisseStore } from '../cloture-caisse.store';
import { ClotureCaisseService } from '../services/cloture-caisse.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cloture-caisse',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ClotureCaisseStore, ClotureCaisseService],
})
export class ClotureCaisseComponent {}
