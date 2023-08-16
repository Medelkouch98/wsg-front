import { Component } from '@angular/core';
import { SpinnerComponent } from '@app/components';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SpinnerComponent, RouterOutlet],
  template: `
    <app-spinner />
    <router-outlet />
  `,
})
export class AppComponent {}
