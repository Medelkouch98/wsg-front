import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImprimesStore } from '../../../imprimes.store';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EtatCartonLiasseEnum, EtatImprimesEnum } from '../../../enum';
import { MoisEnum } from '@app/enums';
import { yearsFrom } from '@app/config';
import { TranslateModule } from '@ngx-translate/core';
import { KeyValuePipe, NgFor } from '@angular/common';
import { FormControlErrorPipe } from '@app/pipes';
import {
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
} from '@app/directives';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImprimesSearchForm, ImprimesSearchFormGroup } from './models';

@Component({
  selector: 'app-imprimes-search-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    NgFor,
    KeyValuePipe,
    TranslateModule,
    ReactiveFormsModule,
    FormControlErrorPipe,
    FieldControlLabelDirective,
    FormControlNumberOnlyDirective,
  ],
  templateUrl: './imprimes-search-form.component.html',
})
export class ImprimesSearchFormComponent implements OnInit, OnDestroy {
  public etatCartonsLiasses = EtatCartonLiasseEnum;
  public etatLiasses = EtatImprimesEnum;
  public mois = Object.values(MoisEnum);
  public annees: number[] = yearsFrom(2017);
  public searchForm: FormGroup<ImprimesSearchFormGroup>;
  public subs: Subscription = new Subscription();

  constructor(private imprimesStore: ImprimesStore, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialiser le formulaire
   * @private
   */
  private initForm(): void {
    this.subs.add(
      this.imprimesStore.imprimesSearchForm$.subscribe(
        (searchForm: ImprimesSearchForm) =>
          (this.searchForm = this.fb.group(
            new ImprimesSearchFormGroup(searchForm)
          ))
      )
    );
  }

  /**
   * Rechercher carton de liasse
   */
  public search(): void {
    this.imprimesStore.setImprimesSearchForm(this.searchForm.getRawValue());
    this.imprimesStore.imprimesSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearch(): void {
    this.imprimesStore.resetImprimesSearchForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
