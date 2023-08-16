import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  ICategorie,
  IEnergie,
  IModeReglement,
  ITypeControle,
} from '@app/models';
import { select, Store } from '@ngrx/store';
import * as resourcesSelector from '../../../../../core/store/resources/resources.selector';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppState } from '../../../../../core/store/app.state';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { IAdvancedSearchForm } from '../../../models';
import { ALPHA_NUMERIC, NUMERO_FACTURE } from '@app/config';
import { ActivityStore } from '../../../activity.store';
import { SearchValidators } from '../../../../../core/validators';
import {
  ClientAutocompleteComponent,
  ImmatriculationControlComponent,
} from '@app/components';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
} from '@app/directives';
import {
  AsyncPipe,
  NgFor,
  NgForOf,
  NgIf,
  TitleCasePipe,
} from '@angular/common';
import { FormControlErrorPipe } from '@app/pipes';
import { ISearchFormGroup } from './models/search-form-group.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-advanced-search-form',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    ClientAutocompleteComponent,
    ImmatriculationControlComponent,
    FormControlNumberOnlyDirective,
    CustomDateMaskDirective,
    FieldControlLabelDirective,
    FormControlErrorPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgForOf,
    TitleCasePipe,
  ],
  templateUrl: './advanced-search-form.component.html',
})
export class AdvancedSearchFormComponent implements OnInit, OnDestroy {
  modesReglement$: Observable<IModeReglement[]> = this.store.pipe(
    select(resourcesSelector.ModesReglementsSelector)
  );
  typesControle$: Observable<ITypeControle[]> = this.store.pipe(
    select(resourcesSelector.TypesControleSelector)
  );
  categories$: Observable<ICategorie[]> = this.store.pipe(
    select(resourcesSelector.CategoriesSelector)
  );
  energies$: Observable<IEnergie[]> = this.store.pipe(
    select(resourcesSelector.EnergiesSelector)
  );
  showMoreSearchCriteria = true;
  searchForm: FormGroup<ISearchFormGroup>;
  maxFromDate: Date;
  maxToDate: Date;
  subscription = new Subscription();

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    public translateService: TranslateService,
    private activityStore: ActivityStore,
    private searchValidators: SearchValidators
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.maxFromDate = new Date();
    this.maxToDate = new Date();
    // récupérer les valeurs du formulaire de recherche depuis le store
    this.subscription.add(
      this.activityStore.AdvancedSearchFormSelector$.pipe(
        tap((searchForm: IAdvancedSearchForm) => {
          this.searchForm.patchValue(searchForm);
        })
      ).subscribe()
    );
  }

  /**
   * Créer le formulaire de recherche
   */
  createForm(): void {
    this.searchForm = this.fb.group<ISearchFormGroup>(
      {
        debut_periode: this.fb.control(null),
        fin_periode: this.fb.control(null),
        numero_dossier: this.fb.control(null, Validators.maxLength(10)),
        numero_liasse_multi_pv: this.fb.control(null),
        numero_liasse: this.fb.control(null),
        numero_facture: this.fb.control(
          null,
          Validators.pattern(NUMERO_FACTURE)
        ),
        nom_controleur: this.fb.control(null, [
          Validators.pattern(ALPHA_NUMERIC),
        ]),
        type_controle_id: this.fb.control(null),
        categorie_id: this.fb.control(null),
        immatriculation: this.fb.control(null),
        numero_serie: this.fb.control(null, [
          Validators.pattern(ALPHA_NUMERIC),
        ]),
        marque: this.fb.control(null, [Validators.pattern(ALPHA_NUMERIC)]),
        modele: this.fb.control(null, [Validators.pattern(ALPHA_NUMERIC)]),
        energie_id: this.fb.control(null),
        client_id: this.fb.control(null),
        nom_client: this.fb.control(null),
        nom_proprietaire: this.fb.control(null),
        mode_reglement_id: this.fb.control(null),
        client: this.fb.control(null),
        proprietaire: this.fb.control(null),
      },
      {
        validators: [
          this.searchValidators.emptyIntervalValidator(
            'debut_periode',
            'fin_periode'
          ),
        ],
      }
    );
  }

  /**
   * Réinitialiser la recherche
   */
  resetSearch() {
    this.activityStore.ResetAdvancedSearchForm();
  }

  /**
   * rechercher les controles
   */
  search() {
    this.activityStore.SetAdvancedSearchForm(this.searchForm.getRawValue());
    this.activityStore.ActivitySearch();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
