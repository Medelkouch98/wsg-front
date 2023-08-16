import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  CustomDateMaskDirective,
  FormControlErrorDirective,
} from '@app/directives';
import { ClientAutocompleteComponent } from '@app/components';
import { TypePersonneEnum } from '@app/enums';
import {
  IFacturationSearchForm,
  IFacturationSearchFormGroup,
} from '../../../models';
import { MatInputModule } from '@angular/material/input';
import { FacturationClientStore } from '../../../facturation-client.store';
import { FormControlErrorPipe } from '@app/pipes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-facturation-search-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TranslateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    CustomDateMaskDirective,
    ClientAutocompleteComponent,
    MatInputModule,
    FormControlErrorPipe,
    FormControlErrorDirective,
  ],
  templateUrl: './facturation-search-form.component.html',
})
export class FacturationSearchFormComponent implements OnInit, OnDestroy {
  public TypePersonneEnum = TypePersonneEnum;
  public searchForm: FormGroup<IFacturationSearchFormGroup>;
  private subs: Subscription = new Subscription();
  constructor(
    public translateService: TranslateService,
    private fb: FormBuilder,
    private facturationClientProStore: FacturationClientStore
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.facturationClientProStore.searchForm$.subscribe(
        (dataSearch: IFacturationSearchForm) => {
          this.createForm(dataSearch);
        }
      )
    );
  }

  /**
   * créer le formulaire
   * @param {IFacturationSearchForm} data
   * @private
   */
  private createForm(data: IFacturationSearchForm): void {
    this.searchForm = this.fb.group<IFacturationSearchFormGroup>({
      start_date: new FormControl(data.start_date, Validators.required),
      end_date: new FormControl(data.end_date, Validators.required),
      client: new FormControl(data.client),
    });
  }

  /**
   * Rechercher
   */
  public search() {
    this.facturationClientProStore.setSearchForm(this.searchForm.getRawValue());
    this.facturationClientProStore.searchControles();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearchForm() {
    this.facturationClientProStore.resetSearchForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
