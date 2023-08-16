import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
} from '@app/directives';
import {
  IMaterialCharacteristic,
  IMaterialCharacteristicFormGroup,
  IMaterialSubType,
} from '../../../models';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Component for managing the form of material characteristics.
 */
@Component({
  selector: 'app-material-characteristics-form',
  templateUrl: './material-characteristics-form.component.html',
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    FieldControlLabelDirective,
    FormControlErrorDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MaterialCharacteristicsFormComponent,
      multi: true,
    },
  ],
})
export class MaterialCharacteristicsFormComponent
  implements ControlValueAccessor
{
  @Input() set subType({ materiel_caracteristiques }: IMaterialSubType) {
    this.initMaterialCharacteristicsForm(materiel_caracteristiques);
  }

  /**
   * Form array for material characteristics.
   */
  public characteristicsForm: FormArray<
    FormGroup<IMaterialCharacteristicFormGroup>
  >;

  private onChange = (_value: IMaterialCharacteristic[]) => {};
  private onTouch = () => {};

  /**
   * Writes the value to the form.
   * @param obj The value to be written.
   */
  writeValue(obj: IMaterialCharacteristic[]): void {
    this.characteristicsForm.controls.forEach((characteristic) => {
      const fieldId = characteristic.getRawValue().id;
      characteristic.controls.valeur.setValue(
        obj?.find(({ id }) => id === fieldId)?.valeur ?? null
      );
    });
  }

  /**
   * Registers a callback function to be invoked when the value changes.
   * @param fn The callback function.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function to be invoked when the input is touched.
   * @param fn The callback function.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /**
   * Sets the disabled state of the form.
   * @param isDisabled Whether the form should be disabled or not.
   */
  setDisabledState?(isDisabled: boolean): void {
    isDisabled && this.characteristicsForm.disable();
  }

  /**
   * Initializes the material characteristics form based on the provided characteristics data.
   * @param characteristics The material characteristics data.
   */
  private initMaterialCharacteristicsForm(
    characteristics: IMaterialCharacteristic[]
  ): void {
    if (!characteristics?.length) return;

    this.characteristicsForm = new FormArray(
      characteristics.map((field) => {
        return new FormGroup<IMaterialCharacteristicFormGroup>({
          id: new FormControl<number>(field.id),
          libelle: new FormControl<string>(field.libelle),
          ...(field.choix?.length && {
            choix: new FormControl<string[]>(field.choix),
          }),
          valeur: new FormControl<string>(null),
        });
      })
    );
  }

  /**
   * Sets the value and triggers the value change event.
   */
  public setValue(): void {
    this.onChange(
      this.characteristicsForm
        .getRawValue()
        .filter(
          (characteristic: IMaterialCharacteristic) => characteristic.valeur
        )
        .map(({ id, valeur }) => ({ id, valeur }))
    );
    this.onTouch();
  }

  /**
   * Gets the label for a characteristic.
   * @param characteristic The characteristic form group.
   * @returns The label of the characteristic.
   */
  public getCharacteristicLabel(
    characteristic: FormGroup<IMaterialCharacteristicFormGroup>
  ): string {
    return characteristic.getRawValue().libelle;
  }

  /**
   * Gets the control type of a characteristic.
   * @param characteristic The characteristic form group.
   * @returns The control type ('select' or 'input') of the characteristic.
   */
  public getCharacteristicControlType(
    characteristic: FormGroup<IMaterialCharacteristicFormGroup>
  ): string {
    return characteristic.getRawValue().choix ? 'select' : 'input';
  }
}
