import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AuditStore } from '../../../../audit.store';
import { IAuditAnomalie, IAuditAnomalieFile } from '../../../../models';
import * as moment from 'moment';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, map, take, tap } from 'rxjs/operators';
import {
  AsyncPipe,
  DatePipe,
  KeyValuePipe,
  NgClass,
  NgFor,
  NgIf,
} from '@angular/common';
import { ConfirmationPopupComponent } from '@app/components';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../../../core/store/app.state';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AuditRowForm,
  IAuditFormGroup,
  IAuditRowForm,
} from './models/audit-form-group.model';
import {
  CustomDateMaskDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { FormControlErrorPipe } from '@app/pipes';
import { GlobalHelper } from '@app/helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-audit-result-table',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    NgIf,
    DatePipe,
    TranslateModule,
    KeyValuePipe,
    AsyncPipe,
    FormControlErrorPipe,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatChipsModule,
    ConfirmationPopupComponent,
    MatDialogModule,
    ReactiveFormsModule,
    CustomDateMaskDirective,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './audit-result-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditResultTableComponent implements OnInit {
  @Input() isReadOnly: boolean;
  @Input() dateAudit: string;
  @Input()
  set anomalies(anomalies: IAuditAnomalie[]) {
    this.createAuditForm();
    // Grouper les anomalies par gravite
    this.groupedAnomalies = this.groupByAnomalieGravity(anomalies);
    this.updateRequiredStatus$.next();
  }
  public groupedAnomalies: { [key: string]: IAuditAnomalie[] };
  public auditForm: FormGroup<IAuditFormGroup>;
  public maxDate: Date = new Date();

  public updateRequiredStatus$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private auditStore: AuditStore,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  createAuditForm() {
    this.auditForm = this.fb.group({
      auditRowsForm: this.fb.array([] as FormGroup<IAuditRowForm>[]),
    });
  }

  ngOnInit() {
    this.store
      .pipe(
        select(AuthSelector.AccessPermissionsSelector),
        map(
          (accessPermissions: PermissionType[]) =>
            !accessPermissions.includes(PermissionType.WRITE)
        )
      )
      .subscribe((isReadOnly) => {
        if (isReadOnly) {
          this.auditRowsForm().disable();
        }
      });
  }

  /**
   * @return FormArray
   */
  auditRowsForm(): FormArray<FormGroup<IAuditRowForm>> {
    return this.auditForm.controls.auditRowsForm;
  }

  /**
   * Grouper les anomalies par gravite
   * @param anomalies IAuditAnomalie[]
   * @return { [key: string]: IAuditAnomalie[] }
   */
  groupByAnomalieGravity(anomalies: IAuditAnomalie[]): {
    [key: string]: IAuditAnomalie[];
  } {
    return anomalies.reduce(
      (acc: { [key: string]: IAuditAnomalie[] }, anomaly: IAuditAnomalie) => {
        this.auditRowsForm().push(
          this.fb.group(new AuditRowForm(anomaly, this.isReadOnly))
        );
        const { gravite } = anomaly;
        if (!acc[gravite]) {
          acc[gravite] = [];
        }
        acc[gravite].push(anomaly);
        return acc;
      },
      {}
    );
  }

  /**
   * Modifier anomalie audit
   * @param element FormGroup<IAuditRowForm>
   */
  updateAuditAnomalie(element: FormGroup<IAuditRowForm>) {
    const updatedValues: { [key: string]: string } = {};
    GlobalHelper.getUpdatedControles(element, updatedValues);
    // Changer le format de date reponse centre
    if ('date_reponse_centre' in updatedValues) {
      updatedValues.date_reponse_centre = moment(
        updatedValues.date_reponse_centre
      ).format('YYYY-MM-DD');
    }
    this.auditStore.updateAuditAnomalie({
      idAnomalie: element.controls.id.value,
      data: updatedValues,
    });
    element.markAsPristine();
  }

  /**
   * Ajouter fichier
   * @param files FileList
   * @param auditAnomalieId number
   */
  addFile(files: FileList, auditAnomalieId: number) {
    let formData = new FormData();
    formData.append('audit_anomalie_id', String(auditAnomalieId));
    formData.append('file', files[0]);
    this.auditStore.addFile(formData);
  }

  /**
   * Récupérer le fichier
   * @param file IAuditAnomalieFile
   */
  getFile(file: IAuditAnomalieFile) {
    this.auditStore.getFile(file);
  }

  /**
   * Supprimer le fichier
   * @param idFile number
   */
  deleteFile(idFile: number) {
    this.dialog
      .open(ConfirmationPopupComponent, {
        data: {
          message: this.translateService.instant('commun.deleteConfirmation'),
          deny: this.translateService.instant('commun.non'),
          confirm: this.translateService.instant('commun.oui'),
        },
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => this.auditStore.deleteFile(idFile))
      )
      .subscribe();
  }

  /**
   * return si anomalie est traité ou de type conforme ou remarque
   * @param element IAuditAnomalie
   * @return Boolean
   */
  checkConstat(element: IAuditRowForm): Boolean {
    return (
      !!element.traite.value ||
      ['conforme', 'rem', 'observation', 'favorable'].includes(
        element.gravite?.value.toLowerCase()
      )
    );
  }

  /**
   * utilisé pour identifier chaque élément dans un tableau afin qu'Angular puisse garder
   * une trace des éléments qui ont été ajoutés, modifiés ou supprimés
   * @param index number
   * @return number
   */
  trackByFn(index: number): number {
    return index;
  }
}
