import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MaterialSearchFormGroup,
  IMaterialSearch,
  IMaterialSearchFormGroup,
  IMaterialCategory,
  IMaterialType,
  IMaterialSubType,
} from '../../../models';
import { IResource } from '@app/models';
import { Observable, Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FieldControlLabelDirective } from '@app/directives';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialStore } from '../../../material.store';
import { ETAT } from '@app/config';

/**
 * Component for material search form.
 */
@Component({
  selector: 'app-material-search-form',
  templateUrl: './material-search-form.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgIf,
    NgFor,
    TranslateModule,
    ReactiveFormsModule,
    FieldControlLabelDirective,
  ],
})
export class MaterialSearchFormComponent implements OnInit, OnDestroy {
  private materialStore = inject(MaterialStore);
  private fb = inject(FormBuilder);

  public states: IResource[] = ETAT;
  public categories$: Observable<IMaterialCategory[]> =
    this.materialStore.categories$;
  public types$: Observable<IMaterialType[]> = this.materialStore.types$;
  public subTypes$: Observable<IMaterialSubType[]> =
    this.materialStore.subTypes$;
  public searchForm: FormGroup<IMaterialSearchFormGroup>;
  private searchFormSub: Subscription;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize the search form.
   */
  private initForm(): void {
    this.searchFormSub = this.materialStore.searchForm$.subscribe(
      (search: IMaterialSearch) =>
        (this.searchForm = this.fb.group(new MaterialSearchFormGroup(search)))
    );
  }

  /**
   * Perform a search.
   */
  public search(): void {
    this.materialStore.setSearchForm(this.searchForm.getRawValue());
  }

  /**
   * Reset the search form.
   */
  public resetSearchForm(): void {
    this.materialStore.resetSearchForm();
  }

  ngOnDestroy() {
    this.searchFormSub?.unsubscribe();
  }
}
