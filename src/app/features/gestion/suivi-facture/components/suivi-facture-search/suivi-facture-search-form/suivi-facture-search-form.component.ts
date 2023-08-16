import { AsyncPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientAutocompleteComponent } from '@app/components';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
} from '@app/directives';
import { IModeReglement } from '@app/models';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppState } from 'app/core/store/app.state';
import * as resourcesSelector from 'app/core/store/resources/resources.selector';
import { Observable, Subscription } from 'rxjs';
import {
  FactureSearchFormGroup,
  IFactureSearchForm,
  IFactureSearchFormGroup,
} from './models';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControlErrorPipe } from '@app/pipes';
import { ApporteurAffaireAutocompleteComponent } from '../../../../../../shared/components/apporteur-affaire-autocomplete/apporteur-affaire-autocomplete.component';
import { SuiviFactureStore } from '../../../suivi-facture.store';
import { FactureStatusEnum, FactureTypeEnum } from '../enums';

@Component({
  selector: 'app-suivi-facture-search-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CustomDateMaskDirective,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule,
    MatSelectModule,
    ClientAutocompleteComponent,
    FieldControlLabelDirective,
    AsyncPipe,
    MatAutocompleteModule,
    FormControlErrorPipe,
    ApporteurAffaireAutocompleteComponent,
    KeyValuePipe,
  ],
  templateUrl: './suivi-facture-search-form.component.html',
})
export class SuiviFactureSearchFormComponent implements OnInit, OnDestroy {
  public modesReglements$: Observable<IModeReglement[]> = this.store.select(
    resourcesSelector.ModesReglementsSelector
  );
  public modesReglementsNegocie$: Observable<IModeReglement[]> =
    this.store.select(resourcesSelector.ModesReglementsNegocieSelector);
  public FACTURE_STATUS = FactureStatusEnum;
  public TYPE_FACTURE = FactureTypeEnum;
  public searchForm: FormGroup<IFactureSearchFormGroup>;
  public subs: Subscription = new Subscription();
  constructor(
    public translateService: TranslateService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private invoiceStore: SuiviFactureStore
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group(new FactureSearchFormGroup());
    this.fillForm();
  }

  /**
   * remplire le formulaire de recherche
   */
  private fillForm(): void {
    this.subs.add(
      this.invoiceStore.searchForm$.subscribe((search: IFactureSearchForm) => {
        this.searchForm.patchValue(search);
      })
    );
  }

  /**
   * Rechercher
   */
  search(): void {
    this.invoiceStore.setSearchForm(this.searchForm.getRawValue());
    this.invoiceStore.InvoicesSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearch(): void {
    this.invoiceStore.resetSearchForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
