import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PrestationStore } from '../../../prestation.store';
import { IResource } from '@app/models';
import { Subscription } from 'rxjs';
import {
  IPrestationsSearchRequestForm,
  IPrestationSearchFormGroup,
  PrestationSearchFormGroup,
} from '../../../models';
import { ETAT, TYPE_PRESTATION } from '@app/config';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FieldControlLabelDirective } from '@app/directives';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-prestation-search-from',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    FieldControlLabelDirective,
    TranslateModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './prestation-search-from.component.html',
})
export class PrestationSearchFromComponent implements OnInit, OnDestroy {
  public searchForm: FormGroup<IPrestationSearchFormGroup>;
  public typePrestations: IResource[] = TYPE_PRESTATION;
  public states: IResource[] = ETAT;
  public searchFormSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private prestationStore: PrestationStore
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initializes/sets the form with values from the store.
   */
  private initForm(): void {
    this.searchFormSub = this.prestationStore.SearchFormSelector$.subscribe(
      (searchForm: IPrestationsSearchRequestForm) =>
        (this.searchForm = this.fb.group(
          new PrestationSearchFormGroup(searchForm)
        ))
    );
  }

  /**
   * recherche de prestations
   */
  public search(): void {
    this.prestationStore.SetPrestationSearchForm(this.searchForm.getRawValue());
    this.prestationStore.PrestationSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  resetSearchForm() {
    this.prestationStore.ResetSearchForm();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
