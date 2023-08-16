import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.state';
import * as resourcesActions from '../../../../core/store/resources/resources.actions';
import { RouterOutlet } from '@angular/router';
import { ClientStore } from '../client.store';
import { ClientsValidators } from '../validators/clients.validators';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [RouterOutlet],
  providers: [ClientStore, ClientsValidators],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class ClientComponent {
  constructor(private store: Store<AppState>) {
    this.store.dispatch(resourcesActions.GetPrestations());
  }
}
