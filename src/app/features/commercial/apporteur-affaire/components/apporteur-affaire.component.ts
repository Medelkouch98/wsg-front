import { Component } from '@angular/core';
import { ApporteurAffaireStore } from '../apporteur-affaire.store';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.state';
import * as resourcesActions from '../../../../core/store/resources/resources.actions';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-apporteur-affaire',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [ApporteurAffaireStore],
})
export class ApporteurAffaireComponent {
  constructor(private store: Store<AppState>) {
    this.store.dispatch(resourcesActions.GetPrestations());
  }
}
