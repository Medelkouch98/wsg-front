import { Component } from '@angular/core';
import { ApporteurAffaireStore } from '../../apporteur-affaire.store';
import { Observable } from 'rxjs';
import { TypeApporteurAffaire } from '@app/config';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../core/store/app.state';
import * as routerSelector from '../../../../../core/store/router/router.selector';
import { map } from 'rxjs/operators';
import { Params } from '@angular/router';
import { ApporteurAffaireFormComponent } from '../apporteur-affaire-form/apporteur-affaire-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-apporteur-affaire-view',
  standalone: true,
  imports: [AsyncPipe, ApporteurAffaireFormComponent],
  template: `
    <app-apporteur-affaire-form
      [addMode]="false"
      [typeApporteurAffaire]="typeApporteur$ | async"
    ></app-apporteur-affaire-form>
  `,
})
export class ApporteurAffaireViewComponent {
  TypeApporteurAffaire = TypeApporteurAffaire;
  typeApporteur$: Observable<TypeApporteurAffaire> = this.store.pipe(
    select(routerSelector.RouterParamsSelector),
    map((params: Params) => params.type as TypeApporteurAffaire)
  );
  constructor(
    private apporteurAffaireStore: ApporteurAffaireStore,
    private store: Store<AppState>
  ) {
    this.apporteurAffaireStore.SetIsIdentificationValidated(false);
  }
}
