import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RolesStore } from '../../../roles.store';
import {
  IRolesSearch,
  IRolesSearchFormGroup,
  RolesSearchFormGroup,
} from '../../../models';

import { AsyncPipe, NgFor } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FieldControlLabelDirective } from '@app/directives';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IResource } from '@app/models';
import { DEFAULT_CHOICES } from '@app/config';

@Component({
  selector: 'app-roles-search-form',
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
  templateUrl: './roles-search-form.component.html',
})
export class RolesSearchFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private rolesStore = inject(RolesStore);
  private translateService = inject(TranslateService);

  public searchForm: FormGroup<IRolesSearchFormGroup>;
  private searchFormSub: Subscription;

  public isRefrenceOptions: IResource[] = DEFAULT_CHOICES;

  ngOnInit(): void {
    this.searchForm = this.fb.group(new RolesSearchFormGroup());
    this.initForm();
  }

  /**
   * Initializes/sets the form with values from the store.
   */
  private initForm(): void {
    this.searchFormSub = this.rolesStore.searchForm$.subscribe(
      (search: IRolesSearch) => this.searchForm.setValue(search)
    );
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.rolesStore.setSearch(this.searchForm.getRawValue());
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearchForm(): void {
    this.rolesStore.resetSearchForm();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
