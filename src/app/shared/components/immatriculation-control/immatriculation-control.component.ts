import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { SivFniFormatHelper } from '@app/helpers';
import { ImmatriculationValidators } from './immatriculation.validators';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControlErrorPipe } from '@app/pipes';
import { FieldControlLabelDirective } from '@app/directives';
import { IImmatriculationControlFormGroupModel } from './models/immatriculation-control-form-group.model';

@Component({
  selector: 'app-immatriculation-control',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    FormControlErrorPipe,
    FieldControlLabelDirective,
  ],
  templateUrl: './immatriculation-control.component.html',
  providers: [
    ImmatriculationValidators,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ImmatriculationControlComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: ImmatriculationControlComponent,
      multi: true,
    },
  ],
})
export class ImmatriculationControlComponent
  implements OnInit, ControlValueAccessor, Validator
{
  form: FormGroup<IImmatriculationControlFormGroupModel>;
  onChange: (value: string) => void;
  onTouch: () => void;
  onValidationChange: () => void;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        formatSivFni: [true],
        immatriculation: [''],
      },
      { validators: [ImmatriculationValidators.formatValidator()] }
    );
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(value: string): void {
    this.form.controls.immatriculation.setValue(value);
    if (!value) {
      this.form.controls.formatSivFni.setValue(true);
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidationChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return !this.form.valid ? { pattern: true } : null;
  }

  /**
   * Formater l'immatriculation au format siv/fni
   * Immatriculation au format siv = oui
   * @return void
   */
  public formaterImmat(): void {
    if (
      this.form.controls.immatriculation.value &&
      this.form.controls.formatSivFni.value
    ) {
      const formatImmat = SivFniFormatHelper.validate(
        this.form.controls.immatriculation.value
      );
      this.form.controls.immatriculation.setValue(formatImmat.immat);
    }
    this.onChange(this.form.controls.immatriculation.value);
    this.onTouch();
    this.onValidationChange();
  }

  /**
   * Forcer la validation du formulaire lorsqu'on modifie la valeur de formatSivFni
   */
  public onFormatSivFniChange(): void {
    this.onValidationChange();
  }
}
