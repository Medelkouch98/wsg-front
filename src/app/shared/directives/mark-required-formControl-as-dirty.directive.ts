import { Subject, Subscription } from 'rxjs';
import { Directive, inject, OnInit, OnDestroy, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';

@Directive({
  selector: '[appMarkRequiredFormControlAsDirty]',
  standalone: true,
})
export class MarkRequiredFormControlAsDirtyDirective
  implements OnInit, OnDestroy
{
  private readonly ngControl = inject(FormGroupDirective, { optional: true });
  private updateRequiredStatusSub: Subscription;

  @Input() updateRequiredStatus$: Subject<void>;

  ngOnInit(): void {
    this.markAllControlsAsDirty(this.ngControl.form);
    // Triggers `markAllControlsAsDirty` method whenever a new value is emitted.
    this.updateRequiredStatusSub = this.updateRequiredStatus$?.subscribe(
      (_: void) => this.markAllControlsAsDirty(this.ngControl.form)
    );
  }

  /**
   * Recursively marks all controls in the given `AbstractControl` and its child controls as dirty.
   * @param {AbstractControl} abstractControl - The control to mark as dirty.
   */
  private markAllControlsAsDirty(abstractControl: AbstractControl): void {
    if (
      abstractControl instanceof FormControl &&
      !abstractControl.value &&
      abstractControl.hasValidator(Validators.required)
    ) {
      abstractControl.markAsDirty({ onlySelf: true });
      abstractControl.markAsTouched();
    } else if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      Object.values(abstractControl.controls).forEach((control) =>
        this.markAllControlsAsDirty(control)
      );
    }
  }
  ngOnDestroy(): void {
    this.updateRequiredStatusSub?.unsubscribe();
  }
}
