import { Component, OnInit, inject } from '@angular/core';
import { UsersStore } from '../users.store';
import { RouterOutlet } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { IWsError } from '@app/models';
import { ToastrService } from 'ngx-toastr';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterOutlet],
  template: `
    <ng-container *ngIf="{ errors: errors$ | async }">
      <router-outlet />
    </ng-container>
  `,
  providers: [UsersStore],
})
export class UsersComponent implements OnInit {
  public usersStore = inject(UsersStore);
  private toastr = inject(ToastrService);
  public errors$: Observable<IWsError> = this.usersStore.errors$.pipe(
    tap(({ messageToShow }) => this.toastr.error(messageToShow))
  );

  ngOnInit(): void {
    this.usersStore.getDesactivationMotifs();
  }
}
