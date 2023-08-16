import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { IResource, IRole } from '@app/models';
import { Observable, Subscription } from 'rxjs';
import { UsersStore } from '../../../users.store';
import {
  IUsersSearch,
  IUsersSearchFormGroup,
  UsersSearchFormGroup,
} from '../../../models';
import { ETAT } from '@app/config';
import { RolesSelector } from '../../../../../../core/store/resources/resources.selector';
import { select, Store } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { AsyncPipe, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FieldControlLabelDirective } from '@app/directives';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users-search-form',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    FieldControlLabelDirective,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './users-search-form.component.html',
})
export class UsersSearchFormComponent implements OnInit, OnDestroy {
  public fb = inject(FormBuilder);
  public usersStore = inject(UsersStore);
  public store = inject(Store<AppState>);

  public states: IResource[] = ETAT;
  public roles$: Observable<IRole[]> = this.store.pipe(select(RolesSelector));

  public searchForm: FormGroup<IUsersSearchFormGroup>;
  private searchFormSub: Subscription;

  ngOnInit(): void {
    this.searchForm = this.fb.group(new UsersSearchFormGroup());
    this.initForm();
  }

  /**
   * Initializes/sets the form with values from the store.
   */
  private initForm(): void {
    this.searchFormSub = this.usersStore.searchForm$.subscribe(
      (search: IUsersSearch) => this.searchForm.setValue(search)
    );
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.usersStore.setSearchForm(this.searchForm.getRawValue());
    this.usersStore.usersSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearchForm(): void {
    this.usersStore.resetSearchForm();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
