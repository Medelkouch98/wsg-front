import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApporteurAffaireStore } from '../../../apporteur-affaire.store';
import { Observable, Subscription } from 'rxjs';
import { IResource } from '@app/models';
import { IApporteurAffaireSearchForm } from '../../../models';
import { ETAT, TypeApporteurAffaire } from '@app/config';
import {
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IApporteurAffaireSearchFormGroupModel } from './models/apporteur-affaire-search-form-group.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-apporteur-affaire-search-form',
  standalone: true,
  imports: [
    NgFor,
    TranslateModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormControlNumberOnlyDirective,
    FieldControlLabelDirective,
  ],
  templateUrl: './apporteur-affaire-search-form.component.html',
})
export class ApporteurAffaireSearchFormComponent implements OnInit, OnDestroy {
  public searchForm: FormGroup<IApporteurAffaireSearchFormGroupModel>;

  public typesApporteurAffaire$: Observable<TypeApporteurAffaire[]> =
    this.apporteurAffaireStore.TypesApporteurAffaireListSelector$;
  public states: IResource[] = ETAT;
  private searchFormSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private apporteurAffaireStore: ApporteurAffaireStore
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initier le formulaire de recherche
   */
  private initForm(): void {
    // Get formGroup values from store
    this.searchFormSub =
      this.apporteurAffaireStore.SearchFormSelector$.subscribe(
        (searchForm: IApporteurAffaireSearchForm) =>
          (this.searchForm = this.fb.group(searchForm))
      );
  }

  /**
   * recherche d'apporteur d'affaire
   */
  public search(): void {
    this.apporteurAffaireStore.SetApporteurAffaireSearchForm(
      this.searchForm.getRawValue()
    );
    this.apporteurAffaireStore.ApporteurAffaireSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearchForm(): void {
    this.apporteurAffaireStore.ResetApporteurAffaireSearchForm();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
