import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { StatisticsStore } from '../../statistics.store';
import { IStatisticsSearch, IStatisticsSearchFormGroup } from '../../models';
import { AsyncPipe, NgFor, KeyValuePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
} from '@app/directives';
import { FormControlErrorPipe } from '@app/pipes';
import { StatisticsModuleEnum } from '../../enum';
import * as moment from 'moment';
import { ETAT } from '@app/config';
import { IResource } from '@app/models';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statistics-search-form',
  standalone: true,
  imports: [
    AsyncPipe,
    KeyValuePipe,
    NgFor,
    NgIf,
    FieldControlLabelDirective,
    CustomDateMaskDirective,
    FormControlErrorPipe,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './statistics-search-form.component.html',
})
export class StatisticsSearchFormComponent implements OnInit, OnDestroy {
  public statisticsModule = StatisticsModuleEnum;
  public searchForm: FormGroup<IStatisticsSearchFormGroup>;
  public states: IResource[] = ETAT;
  private searchFormSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private statisticsStore: StatisticsStore
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initializes/sets the form with values from the store.
   */
  private initForm(): void {
    this.searchFormSub = this.statisticsStore.searchForm$.subscribe(
      (search: IStatisticsSearch) =>
        (this.searchForm = this.fb.group({
          date_debut: [search.date_debut, Validators.required],
          date_fin: [search.date_fin, Validators.required],
          module: [search.module],
        }))
    );
  }

  /**
   * Sets the search criteria on the statisticsStore
   * Call Entities method to retrieve the entities that match the search criteria.
   */
  public search(): void {
    const searchFormValue = this.searchForm.getRawValue();

    searchFormValue.date_debut &&= moment(searchFormValue.date_debut).format(
      'YYYY-MM-DD'
    );
    searchFormValue.date_fin &&= moment(searchFormValue.date_fin).format(
      'YYYY-MM-DD'
    );

    this.statisticsStore.setSearchForm(searchFormValue);
    this.statisticsStore.getEntities();
  }

  /**
   * Reset the search form to its default values.
   */
  public resetSearchForm(): void {
    this.statisticsStore.resetSearchForm();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
