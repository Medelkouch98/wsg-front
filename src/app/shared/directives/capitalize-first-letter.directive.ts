import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCapitalizeFirstLetter]',
  standalone: true,
})
export class CapitalizeFirstLetterDirective {
  ngControl = inject(NgControl, { self: true });

  @HostListener('blur')
  onInputBlur() {
    const value = this.ngControl.control.value;

    if (value && value.length > 0) {
      this.ngControl.control.setValue(
        value.charAt(0).toUpperCase() + value.slice(1)
      );
    }
  }
}
