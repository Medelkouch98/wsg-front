import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExportsStore } from '../exports.store';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ExportsStore],
})
export class ExportsComponent {}
