import { Component } from '@angular/core';
import { ActivityStore } from '../activity.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [RouterModule],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ActivityStore],
})
export class ActivityComponent {}
