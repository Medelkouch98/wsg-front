import { Component, OnInit, inject } from '@angular/core';
import { RolesStore } from '../roles.store';
import { RolesService } from '../services/roles.service';
import { Observable, tap } from 'rxjs';
import { IWsError } from '@app/models';
import { ToastrService } from 'ngx-toastr';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterOutlet],
  template: `
    <ng-container *ngIf="{ errors: errors$ | async }">
      <router-outlet />
    </ng-container>
  `,
  providers: [RolesStore, RolesService],
})
export class RolesComponent implements OnInit {
  private rolesStore = inject(RolesStore);
  private toaster = inject(ToastrService);

  public errors$: Observable<IWsError> = this.rolesStore.errors$.pipe(
    tap(({ messageToShow }) => this.toaster.error(messageToShow))
  );

  ngOnInit(): void {
    this.rolesStore.rolesSearch();
  }
}
