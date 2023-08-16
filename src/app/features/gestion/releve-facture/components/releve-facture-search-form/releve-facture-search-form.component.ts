import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReleveFactureStore } from '../../releve-facture.store';
import { IReleveFactureSearchFormGroup, ISearchCriteria } from '../../models';
import { Observable, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
} from '@app/directives';
import { FormControlErrorPipe } from '@app/pipes';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AppState } from '../../../../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import { IModeReglement, IResource } from '@app/models';
import * as resourcesSelector from '../../../../../core/store/resources/resources.selector';
import { ETAT_FACTURE } from '@app/config';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-releve-facture-search-form',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TranslateModule,
    MatDatepickerModule,
    CustomDateMaskDirective,
    FormControlErrorPipe,
    FieldControlLabelDirective,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    NgIf,
    NgForOf,
    AsyncPipe,
  ],
  templateUrl: './releve-facture-search-form.component.html',
})
export class ReleveFactureSearchFormComponent implements OnInit, OnDestroy {
  public etatFacture: IResource[] = ETAT_FACTURE;
  private searchFormSub: Subscription = new Subscription();

  public searchForm: FormGroup<IReleveFactureSearchFormGroup>;
  modesReglement$: Observable<IModeReglement[]> = this.store.pipe(
    select(resourcesSelector.ModesReglementsNegocieSelector)
  );

  constructor(
    private fb: FormBuilder,
    private releveFactureStore: ReleveFactureStore,
    private store: Store<AppState>,
    public translateService: TranslateService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.searchFormSub = this.releveFactureStore.searchForm$.subscribe(
      (search: ISearchCriteria) => {
        this.searchForm.patchValue(search);
      }
    );
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.releveFactureStore.setSearchForm(this.searchForm.getRawValue());
    this.releveFactureStore.releveFactureSearch();
  }

  /**
   * Créer le formulaire de recherche
   */
  private createForm(): void {
    this.searchForm = this.fb.group<IReleveFactureSearchFormGroup>({
      start_date: new FormControl('', Validators.required),
      end_date: new FormControl('', Validators.required),
      negocie_en: new FormControl(),
      client_denomination: new FormControl(),
      facture_status: new FormControl(),
      releve: new FormControl(),
    });
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }

  /**
   * réinitialiser le formulaire de recherche
   */
  resetSearchForm(): void {
    this.releveFactureStore.resetSearchForm();
  }
}
