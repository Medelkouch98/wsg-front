import { Component } from '@angular/core';
import { PrestationStore } from '../prestation.store';
import { PrestationService } from '../services/prestation.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-prestation',
  standalone: true,
  imports: [RouterOutlet],
  providers: [PrestationStore, PrestationService],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class PrestationComponent {}
