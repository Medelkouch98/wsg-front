import { Component } from '@angular/core';
import { ApporteurAffaireStore } from '../../apporteur-affaire.store';
import { TypeApporteurAffaire } from '@app/config';
import { ApporteurAffaireFormComponent } from '../apporteur-affaire-form/apporteur-affaire-form.component';

@Component({
  selector: 'app-apporteur-affaire-add',
  standalone: true,
  imports: [ApporteurAffaireFormComponent],
  template: `
    <app-apporteur-affaire-form
      [addMode]="true"
      [typeApporteurAffaire]="TypeApporteurAffaire.local"
    ></app-apporteur-affaire-form>
  `,
})
export class ApporteurAffaireAddComponent {
  TypeApporteurAffaire = TypeApporteurAffaire;
  constructor(private apporteurAffaireStore: ApporteurAffaireStore) {
    this.apporteurAffaireStore.InitialiseApporteurAffaire();
  }
}
