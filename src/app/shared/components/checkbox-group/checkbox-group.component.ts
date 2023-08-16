import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * CheckboxGroupComponent is a custom Angular component that provides a checkbox group functionality.
 * It implements the ControlValueAccessor interface to allow for two-way binding with Angular forms.
 *
 * @example
 * <app-checkbox-group [(ngModel)]="checkboxValues">
 *   <input type="checkbox" [value]="value1" /> Label 1
 *   <input type="checkbox" [value]="value2" /> Label 2
 *   ...
 * </app-checkbox-group>
 */
@Component({
  selector: 'app-checkbox-group',
  template: `
    <ng-content />
  `,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxGroupComponent,
      multi: true,
    },
  ],
})
export class CheckboxGroupComponent implements ControlValueAccessor {
  private value: string[] = [];
  private disabled = false;

  /**
   * Function to call when the value of the checkbox group changes.
   */
  onChange = (_value: string[]) => {};

  /**
   * Function to call when the checkbox group is touched.
   */
  onTouch = () => {};

  /**
   * Writes a new value to the checkbox group.
   * @param {string[]} value - The new value to write.
   */
  writeValue(value: string[]): void {
    this.value = value;
  }

  /**
   * Registers a callback function to call when the value of the checkbox group changes.
   * @param {function} fn - The callback function.
   */
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function to call when the checkbox group is touched.
   * @param {function} fn - The callback function.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /**
   * Toggles a value in the checkbox group.
   * @param {string} selectedValue - The value to toggle.
   */
  toggleValue(selectedValue: string): void {
    const index = this.value.indexOf(selectedValue);

    if (index > -1) {
      this.value = [
        ...this.value.slice(0, index),
        ...this.value.slice(index + 1),
      ];
    } else {
      this.value = [...this.value, selectedValue];
    }

    this.onChange(this.value);
    this.onTouch();
  }

  /**
   * Checks if a value is selected in the checkbox group.
   * @param {string} valueToCheck - The value to check.
   * @returns {boolean} - True if the value is selected, false otherwise.
   */
  isSelected(valueToCheck: string): boolean {
    return this.value.includes(valueToCheck);
  }

  /**
   * Checks if the checkbox group is disabled.
   * @returns {boolean} - True if the checkbox group is disabled, false otherwise.
   */
  isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Sets the disabled state of the checkbox group.
   * @param {boolean} isDisabled - The new disabled state.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
