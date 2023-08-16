import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  IExportSapTuvRequestFormGroup,
  IExportSapTuvRequest,
} from '../../../models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import {
  CustomDateMaskDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgIf } from '@angular/common';
import * as moment from 'moment';
import { MatInputModule } from '@angular/material/input';
import { ExportSapTuvStore } from '../../../export-sap-tuv.store';

@Component({
  selector: 'app-export-sap-tuv-search-form',
  templateUrl: './export-sap-tuv-search-form.component.html',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CustomDateMaskDirective,
    MarkRequiredFormControlAsDirtyDirective,
    FormControlErrorDirective,
  ],
})
export class ExportSapTuvSearchFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private exportSapTuvStore = inject(ExportSapTuvStore);

  public searchForm: FormGroup<IExportSapTuvRequestFormGroup>;
  private searchFormSub: Subscription;

  ngOnInit(): void {
    this.initForm();
    this.searchFormSub = this.exportSapTuvStore.searchForm$.subscribe(
      (searchForm: IExportSapTuvRequest) =>
        this.searchForm.patchValue(searchForm)
    );
  }

  private initForm(): void {
    this.searchForm = this.fb.group<IExportSapTuvRequestFormGroup>({
      date_debut: new FormControl(null, Validators.required),
      date_fin: new FormControl(null, Validators.required),
    });
  }

  public resetSearchForm(): void {
    this.exportSapTuvStore.resetSearchForm();
  }

  /**
   * Exports the SAP TUV data.
   */
  public exportSapTuv(): void {
    const formValue = this.searchForm.value;
    let exportSapTuvRequest: IExportSapTuvRequest = {
      date_debut: formValue.date_debut
        ? moment(formValue.date_debut, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
      date_fin: formValue.date_fin
        ? moment(formValue.date_fin, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
    };

    this.exportSapTuvStore.setSearchForm(exportSapTuvRequest);
    this.exportSapTuvStore.exportSapTuv();
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }
}
