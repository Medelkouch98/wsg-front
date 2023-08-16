import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReglementStore } from '../../../reglement.store';
import { IReglementSearchFormGroup, ISearchCriteria } from '../../../models';
import { Observable, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { FormControlErrorPipe } from '@app/pipes';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppState } from '../../../../../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import { IModeReglement, IResource } from '@app/models';
import * as resourcesSelector from '../../../../../../core/store/resources/resources.selector';
import { TYPE_CLIENT } from '@app/config';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { take, withLatestFrom } from 'rxjs/operators';
import { RouterQueryParamsSelector } from '../../../../../../core/store/router/router.selector';
import { Params } from '@angular/router';

@Component({
  selector: 'app-reglement-search-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    TranslateModule,
    MatDatepickerModule,
    FormControlErrorPipe,
    MatSelectModule,
    AsyncPipe,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FieldControlLabelDirective,
    CustomDateMaskDirective,
    NgIf,
    NgForOf,
    MatInputModule,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './reglement-search-form.component.html',
})
export class ReglementSearchFormComponent implements OnInit, OnDestroy {
  public typeClient: IResource[] = TYPE_CLIENT;
  private searchFormSub: Subscription = new Subscription();

  public searchForm: FormGroup<IReglementSearchFormGroup>;
  public modesReglement$: Observable<IModeReglement[]> = this.store.pipe(
    select(resourcesSelector.ModesReglementsSelector)
  );

  constructor(
    private fb: FormBuilder,
    private reglementStore: ReglementStore,
    private store: Store<AppState>
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.searchFormSub.add(
      this.reglementStore.searchForm$
        .pipe(
          take(1),
          withLatestFrom(this.store.pipe(select(RouterQueryParamsSelector)))
        )
        .subscribe(([search, params]: [ISearchCriteria, Params]) => {
          //fill the search bar with the data from the url when being redirected from cloture caisse UI
          if (
            params?.date_reglement_start &&
            params?.date_reglement_end &&
            params?.mode_reglement_id
          ) {
            search.date_reglement_start = params.date_reglement_start;
            search.date_reglement_end = params.date_reglement_end;
            search.mode_reglement_id = +params.mode_reglement_id;
            this.searchForm.patchValue(search);
            this.search();
          }
        })
    );
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.reglementStore.setSearchForm(this.searchForm.getRawValue());
    this.reglementStore.reglementSearch();
  }

  /**
   * Créer le formulaire de recherche
   */
  private createForm(): void {
    this.searchForm = this.fb.group<IReglementSearchFormGroup>({
      date_reglement_start: new FormControl('', Validators.required),
      date_reglement_end: new FormControl('', Validators.required),
      mode_reglement_id: new FormControl(),
      numero_facture: new FormControl(),
      nom_client: new FormControl(),
      type_client: new FormControl(),
      reference: new FormControl(),
    });
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }

  /**
   * réinitialiser le formulaire de recherche
   */
  resetSearchForm(): void {
    this.reglementStore.resetSearchForm();
  }
}
