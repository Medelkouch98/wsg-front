import { Directive, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appFormControlNumberOnly]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormControlNumberOnlyDirective,
      multi: true,
    },
  ],
})
export class FormControlNumberOnlyDirective implements ControlValueAccessor {
  private onChange: (value: any) => {};
  onTouch: () => void;

  constructor(private _el: ElementRef) {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  private setInputValue(value: string): void {
    value = value.replace(/[^0-9]*/g, '');
    this._el.nativeElement.value = value;
    this.onChange(value);
    this.onTouch();
  }

  writeValue(value: string): void {
    this._el.nativeElement.value = value
      ? value.replace(/[^0-9]*/g, '')
      : value;
  }

  @HostListener('input') onInputChange() {
    this.setInputValue(this._el.nativeElement.value);
  }
}
