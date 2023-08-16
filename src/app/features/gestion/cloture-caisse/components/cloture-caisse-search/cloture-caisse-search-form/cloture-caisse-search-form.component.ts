import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import {
  CustomDateMaskDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControlErrorPipe } from '@app/pipes';
import { NgIf } from '@angular/common';
import {
  IClotureCaisseSearchFormGroup,
  ISearchCriteria,
} from '../../../models';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-cloture-caisse-search-form',
  standalone: true,
  imports: [
    TranslateModule,
    MatCardModule,
    ReactiveFormsModule,
    MarkRequiredFormControlAsDirtyDirective,
    MatFormFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDatepickerModule,
    CustomDateMaskDirective,
    FormControlErrorPipe,
    NgIf,
    MatSlideToggleModule,
  ],
  templateUrl: './cloture-caisse-search-form.component.html',
})
export class ClotureCaisseSearchFormComponent implements OnInit, OnDestroy {
  private searchFormSub: Subscription = new Subscription();

  public searchForm: FormGroup<IClotureCaisseSearchFormGroup>;
  constructor(
    private fb: FormBuilder,
    private clotureCaisseStore: ClotureCaisseStore
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.searchFormSub.add(
      this.clotureCaisseStore.searchForm$.subscribe(
        (search: ISearchCriteria) => {
          this.searchForm.patchValue(search);
        }
      )
    );
    this.search();
  }

  /**
   * Créer le formulaire de recherche
   */
  private createForm(): void {
    this.searchForm = this.fb.group<IClotureCaisseSearchFormGroup>({
      date_debut: new FormControl(null, Validators.required),
      date_fin: new FormControl(null, Validators.required),
      fin_mois: new FormControl(false),
    });
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }

  /**
   * réinitialiser le formulaire de recherche
   */
  resetSearchForm(): void {
    this.clotureCaisseStore.resetSearchForm();
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.clotureCaisseStore.setSearchForm(this.searchForm.getRawValue());
    this.clotureCaisseStore.clotureCaisseSearch();
  }
}
