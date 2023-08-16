import { Component } from '@angular/core';
import { ClientStore } from '../../client.store';
import { ClientFormComponent } from '../client-form/client-form.component';

@Component({
  selector: 'app-client-view',
  standalone: true,
  imports: [ClientFormComponent],
  template: `
    <app-client-form [addMode]="false"></app-client-form>
  `,
})
export class ClientViewComponent {
  constructor(private clientStore: ClientStore) {
    this.clientStore.getClient();
    this.clientStore.setIsIdentificationValidated(false);
  }
}
