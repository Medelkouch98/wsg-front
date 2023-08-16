import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCustomDateMaskDirective]',
  standalone: true,
})
export class CustomDateMaskDirective {
  @HostListener('keyup', ['$event']) onKeyDown(e: KeyboardEvent) {
    this._el.nativeElement.value = this._el.nativeElement.value.replace(
      /[^0-9 |\/]/g,
      ''
    );
    let value: string = this._el.nativeElement.value;

    //si la valeur saisie est un nombre, on applique le mask
    const isNumber = /^\d$/i.test(e.key);

    if (isNumber) {
      let sections = value.split('/'); //pour recuperer chaque partie à part dd, mm, yyyy
      if (sections[0]) {
        //gerer le mask du jour
        let day = parseInt(sections[0]);
        if (day > 3 && day < 10) {
          sections[0] = '0' + day + '/';
        } else if (sections[0].length == 2) {
          //si l'utilisateur saisi 10-31 ou bien 01-09
          sections[0] += '/';
        }
      }
      if (sections[1]) {
        //gerer le mask du mois
        let month = parseInt(sections[1]);
        if (month < 0) {
          //correction input
          sections[1] = '01/';
        } else if (month > 12) {
          //correction input
          sections[1] = '12/';
        } else if (month > 1 && month < 10) {
          sections[1] = '0' + month + '/';
        } else if (sections[1].length == 2) {
          //si l'utilisateur saisi 10-2 ou bien 01-09
          sections[1] += '/';
        }
      }
      this._el.nativeElement.value = sections.join('');
    }
  }

  constructor(private _el: ElementRef) {}
}
