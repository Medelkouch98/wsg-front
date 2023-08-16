import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControlErrorPipe } from '@app/pipes';
import { FieldControlLabelDirective } from '@app/directives';
import { ImmatriculationValidators } from '../immatriculation-control/immatriculation.validators';
import { IOptionalDropDownDetails, IOptionalDropDownFormGroup } from './models';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-optional-dropdown[data][mainTitle][subTitle]',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    FormControlErrorPipe,
    FieldControlLabelDirective,
    MatSelectModule,
    NgForOf,
    FormsModule,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './optional-dropdown.component.html',
  providers: [
    ImmatriculationValidators,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: OptionalDropdownComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: OptionalDropdownComponent,
      multi: true,
    },
  ],
})
export class OptionalDropdownComponent
  implements OnInit, OnDestroy, ControlValueAccessor, Validator
{
  /**
   * @description l'id des données qui seront envoyées lors de la sélection de 'others'
   * @default -1
   */
  @Input() defaultId: number = -1; //
  /**
   * @description les données qui seront affichées dans la liste déroulante
   */
  @Input() data: IOptionalDropDownDetails[];
  /**
   * @description le titre du dropdown
   */
  @Input() mainTitle: string;
  /**
   * @description le titre du champ textarea
   */
  @Input() subTitle: string;

  form: FormGroup<IOptionalDropDownFormGroup>;
  subscription: Subscription = new Subscription();

  onChange: (value: IOptionalDropDownDetails) => void;
  onTouch: () => void;
  onValidationChange: () => void;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(undefined, [Validators.required]),
      libelle: new FormControl('', [Validators.required]),
    });

    this.subscription.add(
      this.form.controls.libelle.valueChanges
        .pipe(
          debounceTime(400),
          tap(() => this.onValidationChange()),
          filter((value: string) => !!value && this.form.valid),
          tap(() => {
            this.onChange(this.form.getRawValue());
            this.onTouch();
          })
        )
        .subscribe()
    );
  }

  /**
   * @param fn
   */
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  /**
   * @param fn
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  @Output() onSelectionChange: EventEmitter<IOptionalDropDownDetails> = new EventEmitter<IOptionalDropDownDetails>();
  /**
   * @param {IOptionalDropDownDetails} value
   */
  writeValue(value: IOptionalDropDownDetails): void {
    this.form.controls.libelle.setValue(value?.libelle);
    this.form.controls.id.setValue(value?.id);
  }

  /**
   * @param {() => void} fn
   */
  registerOnValidatorChange?(fn: () => void): void {
    this.onValidationChange = fn;
  }

  /**
   * @param {AbstractControl<any, any>} control
   * @returns {ValidationErrors}
   */
  validate(control: AbstractControl<any, any>): ValidationErrors {
    return !this.form.valid ? { required: true } : null;
  }

  /**
   * lorsqu'on change la selection on modifie le libellé et on lance la validation
   * @param {MatSelectChange} $event
   */
  selectionChange($event: MatSelectChange) {
    const value: IOptionalDropDownDetails = this.data?.find(
      (v) => v.id === $event.value
    );
    this.form.controls.libelle.setValue(value?.libelle);
    this.onValidationChange();
    this.onSelectionChange.emit(value);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
