import { Component, OnInit, inject } from '@angular/core';
import { UsersStore } from '../../users.store';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [UserFormComponent],
  template: `
    <app-user-form [addMode]="true" />
  `,
})
export class UserAddComponent implements OnInit {
  private usersStore = inject(UsersStore);

  ngOnInit(): void {
    this.usersStore.initUser();
  }
}
