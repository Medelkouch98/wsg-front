import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeResourceUrl',
  standalone: true,
})
export class SanitizeResourceUrlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

  transform(v: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustResourceUrl(v);
  }
}
