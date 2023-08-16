import { NgFor, NgIf } from '@angular/common';
import { OnInit, Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators,
  NG_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import {
  IMaterialMaintenanceCompany,
  IMaterialMaintenanceCompanyFormGroup,
} from '../../../models';
import { EMAIL_PATTERN, MOBILE_PATTERN } from '@app/config';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';

/**
 * Component representing a form for material maintenance company details.
 */
@Component({
  selector: 'app-material-maintenance-company-form',
  templateUrl: './material-maintenance-company-form.component.html',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MarkRequiredFormControlAsDirtyDirective,
    FieldControlLabelDirective,
    FormControlErrorDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MaterialMaintenanceCompanyFormComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: MaterialMaintenanceCompanyFormComponent,
      multi: true,
    },
  ],
})
export class MaterialMaintenanceCompanyFormComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  public maintenanceCompanyForm: FormGroup<IMaterialMaintenanceCompanyFormGroup>;
  public formChangesSub: Subscription;
  public updateRequiredStatus$ = new Subject<void>();

  ngOnInit(): void {
    // Initialize the maintenance company form
    this.maintenanceCompanyForm =
      new FormGroup<IMaterialMaintenanceCompanyFormGroup>({
        id: new FormControl(null),
        nom: new FormControl('', [
          Validators.required,
          Validators.maxLength(40),
        ]),
        telephone: new FormControl('', [
          Validators.required,
          Validators.pattern(MOBILE_PATTERN),
        ]),
        email: new FormControl('', Validators.pattern(EMAIL_PATTERN)),
      });

    // Subscribe to form value changes
    this.formChangesSub = this.maintenanceCompanyForm.valueChanges.subscribe(
      (val) => {
        // Trigger change event
        this.onChange(val as IMaterialMaintenanceCompany);
        // Trigger touch event
        this.onTouch();
        // Trigger validation change event
        this.onValidationChange();
      }
    );
  }

  private onChange = (_value: IMaterialMaintenanceCompany) => {};
  private onTouch = () => {};

  /**
   * Callback function to be invoked when the validation of the form control changes.
   */
  private onValidationChange = () => {};

  /**
   * Writes a new value to the form control.
   * @param obj The new value for the form control.
   */
  writeValue(obj: IMaterialMaintenanceCompany): void {
    this.maintenanceCompanyForm.patchValue(obj);
    // Emit an event to update the required status of form controls
    this.updateRequiredStatus$.next();
  }

  /**
   * Registers a callback function to be invoked when the form control value changes.
   * @param fn The callback function to register.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Validates the form control.
   * @returns The validation errors, if any. Otherwise, null.
   */
  validate(): ValidationErrors | null {
    return this.maintenanceCompanyForm?.invalid ? { invalid: true } : null;
  }

  /**
   * Registers a callback function to be invoked when the form control's validation changes.
   * @param fn The callback function to register.
   */
  registerOnValidatorChange?(fn: () => void): void {
    this.onValidationChange = fn;
  }

  /**
   * Registers a callback function to be invoked when the form control is touched.
   * @param fn The callback function to register.
   */
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  /**
   * Sets the disabled state of the form control.
   * @param isDisabled Whether the form control should be disabled or not.
   */
  setDisabledState?(isDisabled: boolean): void {
    isDisabled && this.maintenanceCompanyForm.disable();
  }

  ngOnDestroy(): void {
    // Unsubscribe from form value changes
    this.formChangesSub?.unsubscribe();
  }
}
