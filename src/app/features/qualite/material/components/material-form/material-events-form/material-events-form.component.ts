import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import * as moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';
import {
  IMaterialEvent,
  IMaterialSubTypeEventType,
  IMaterialEventFormGroup,
  IMaterialSubType,
} from '../../../models';

/**
 * Component for displaying and managing material events form.
 */
@Component({
  selector: 'app-material-events-form',
  templateUrl: './material-events-form.component.html',
  standalone: true,
  imports: [
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    TranslateModule,
    FieldControlLabelDirective,
    FormControlErrorDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MaterialEventsFormComponent,
      multi: true,
    },
  ],
})
export class MaterialEventsFormComponent implements ControlValueAccessor {
  @Input() set subType({ materiel_evenement_types }: IMaterialSubType) {
    this.initMaterialEventsForm(materiel_evenement_types);
  }

  /**
   * Form array to hold the event form groups.
   */
  public eventsForm: FormArray<FormGroup<IMaterialEventFormGroup>>;

  private onChange = (_value: IMaterialEvent[]) => {};
  private onTouch = () => {};

  /**
   * Writes a new value to the form.
   * @param obj The new value to be written.
   */
  writeValue(obj: IMaterialEvent[]): void {
    this.eventsForm.controls.forEach((event) => {
      const fieldId = event.getRawValue().id;
      event.controls.date.setValue(
        obj?.find(({ id }) => id === fieldId)?.date ?? null
      );
    });
  }

  /**
   * Registers a callback function to be invoked when the form value changes.
   * @param fn The callback function.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function to be invoked when the form is touched.
   * @param fn The callback function.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /**
   * Sets the disabled state of the form.
   * @param isDisabled A boolean value indicating whether the form should be disabled or not.
   */
  setDisabledState?(isDisabled: boolean): void {
    isDisabled && this.eventsForm.disable();
  }

  /**
   * Initializes the material events form based on the provided event types.
   * @param events The event types for the material sub-type.
   */
  private initMaterialEventsForm(events: IMaterialSubTypeEventType[]): void {
    if (!events?.length) return;

    this.eventsForm = new FormArray(
      events
        .filter((field: IMaterialSubTypeEventType) => field.is_required)
        .map((field) => {
          return new FormGroup<IMaterialEventFormGroup>({
            materiel_evenement_type_id: new FormControl<number>(field.id),
            libelle: new FormControl<string>(field.libelle),
            date: new FormControl<string>(null),
          });
        })
    );
  }

  /**
   * Sets the value of the form and triggers the `onChange` callback.
   */
  public setValue(): void {
    this.onChange(
      this.eventsForm
        .getRawValue()
        .filter((event: IMaterialEvent) => event.date)
        .map(({ materiel_evenement_type_id, date }) => ({
          materiel_evenement_type_id,
          date: date ? moment(date).format('YYYY-MM-DD') : null,
        }))
    );
    this.onTouch();
  }

  /**
   * Retrieves the label for an event based on its form group.
   * @param event The form group representing the event.
   * @returns The label for the event.
   */
  public getEventLabel(event: FormGroup<IMaterialEventFormGroup>): string {
    return event.getRawValue().libelle;
  }
}
