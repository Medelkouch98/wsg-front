import { Directive, HostListener, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { first } from 'rxjs/operators';

@Directive({
  selector: '[appDecimalNumber]',
  standalone: true,
})
export class DecimalNumberDirective implements OnInit {
  fractionDigits: number = 2;
  ngControl = inject(NgControl, { self: true });

  @HostListener('blur')
  onInputBlur() {
    const value = this.ngControl.control.value;
    if (!!value) {
      //on fait le formattage uniquement lorsqu'on a une valeur
      this.ngControl.control.setValue(
        Number(value).toFixed(this.fractionDigits),
        { emitEvent: false }
      );
    }
  }

  ngOnInit(): void {
    //on format la 1er valeur (valeur initial)
    this.ngControl.control.valueChanges
      .pipe(first())
      .subscribe(() => this.onInputBlur());
  }
}
