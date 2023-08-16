import { Component, Inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import {
  IDesactivationMotif,
  IInactivityReasonFormGroup,
} from '../../../models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  IOptionalDropDownDetails,
  OptionalDropDownDetails,
} from 'app/shared/components/optional-dropdown/models';
import { OptionalDropdownComponent } from '@app/components';

/**
 * A dialog component for selecting a reason for inactivity.
 */
@Component({
  selector: 'app-inactivity-reason-popup',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    OptionalDropdownComponent,
  ],
  templateUrl: './inactivity-reason-popup.component.html',
})
export class InactivityReasonPopupComponent {
  public reasonForm: FormGroup<IInactivityReasonFormGroup>;
  public desactivationReasons: IOptionalDropDownDetails[];
  constructor(
    private dialogRef: MatDialogRef<InactivityReasonPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: IDesactivationMotif[],
    private fb: FormBuilder
  ) {
    this.desactivationReasons = data?.map(
      ({ id, libelle }) => new OptionalDropDownDetails(id, libelle)
    );
    this.initReasonForm();
  }

  /**
   * Initializes the reason form
   * @returns {void}
   */
  private initReasonForm(): void {
    this.reasonForm = this.fb.group({
      reason: new FormControl({ id: null, libelle: '' }),
    });
  }

  /**
   * Updates the reason for deactivation and closes the dialog.
   * @param {boolean} confirm - A flag indicating whether the reason is confirmed or not.
   * @returns {void}
   */
  public updateReason(): void {
    const formValue = this.reasonForm.getRawValue();
    const reason: IDesactivationMotif = {
      id: formValue.reason.id,
      libelle: formValue.reason.libelle,
    };
    this.dialogRef.close(reason);
  }
}
