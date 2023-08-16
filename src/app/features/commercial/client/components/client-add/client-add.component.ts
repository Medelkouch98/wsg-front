import { Component } from '@angular/core';
import { ClientStore } from '../../client.store';
import { ClientFormComponent } from '../client-form/client-form.component';

@Component({
  selector: 'app-client-add',
  standalone: true,
  imports: [ClientFormComponent],
  template: `
    <app-client-form [addMode]="true"></app-client-form>
  `,
})
export class ClientAddComponent {
  constructor(private clientStore: ClientStore) {
    this.clientStore.initialiseClient();
  }
}
