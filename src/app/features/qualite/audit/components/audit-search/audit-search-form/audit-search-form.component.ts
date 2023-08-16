import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { yearsFrom } from '@app/config';
import { AuditStore } from '../../../audit.store';
import { Observable, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { AsyncPipe, NgFor } from '@angular/common';
import { FieldControlLabelDirective } from '@app/directives';
import { IAuditSearchForm, IAuditSearchFormGroup } from './models';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ITypeAudit } from '../../../models';

@Component({
  selector: 'app-audit-search-form',
  standalone: true,
  imports: [
    TranslateModule,
    FormControlErrorPipe,
    AsyncPipe,
    NgFor,
    ReactiveFormsModule,
    FieldControlLabelDirective,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './audit-search-form.component.html',
})
export class AuditSearchFormComponent implements OnInit, OnDestroy {
  public typesAudit$: Observable<ITypeAudit[]> = this.auditStore.typesAudit$;
  public searchForm: FormGroup<IAuditSearchFormGroup>;
  public annees: number[] = yearsFrom(2015);
  public typesAudit: ITypeAudit[] = [];
  public subs: Subscription = new Subscription();
  constructor(private fb: FormBuilder, private auditStore: AuditStore) {}

  ngOnInit(): void {
    this.auditStore.getAuditTypes();
    this.initForm();
  }

  /**
   * Initier le formulaire de recherche
   * @private
   */
  private initForm() {
    this.subs.add(
      this.auditStore.searchForm$.subscribe(
        (searchForm: IAuditSearchForm) =>
          (this.searchForm = this.fb.group({
            year: [searchForm.year, Validators.required],
            type_audit_id: [searchForm.type_audit_id, Validators.required],
          }))
      )
    );
  }

  /**
   * Rechercher
   * @public
   */
  public search() {
    this.auditStore.setAuditSearchForm(this.searchForm.getRawValue());
    this.auditStore.searchAudits();
  }

  /**
   * Réinitialiser la recherche
   * @public
   */
  public resetSearchForm() {
    this.auditStore.resetAuditSearchForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
