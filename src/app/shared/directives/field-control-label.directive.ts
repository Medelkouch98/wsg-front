import { Directive, Input, AfterViewInit, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Directive that can be used to set the placeholder text.
 * if appFieldControlLabel is set with a value then placeholder is set with it else it took the value of the label
 *
 * @example
 * <mat-form-field [appFieldControlLabel]="Placeholder">
 *   <mat-label>Label</mat-label>
 *   <input matInput />
 * </mat-form-field>
 */
@Directive({
  selector: '[appFieldControlLabel]',
  standalone: true,
})
export class FieldControlLabelDirective implements AfterViewInit {
  /**
   * The placeholder text to be displayed in the mat-form-field element.
   */
  @Input() appFieldControlLabel: string;

  constructor(
    private translateService: TranslateService,
    private el: ElementRef
  ) {}

  /**
   * Sets the placeholder text of the input element to the translated value of the appPlaceholder input.
   */
  ngAfterViewInit() {
    const select = this.el.nativeElement.querySelector(
      '.mat-mdc-select-placeholder'
    );
    const placeholder = this.getFieldControlPlaceholder(!!select);

    if (!placeholder) return;
    const input = this.el.nativeElement.querySelector('input');
    // in case of input
    input?.setAttribute('placeholder', placeholder);
    // in case of select
    if (select) {
      select.innerText = placeholder;
    }
  }

  private getFieldControlPlaceholder(isSelect: boolean): string {
    if (this.appFieldControlLabel) return this.appFieldControlLabel;
    return this.translateService.instant(
      isSelect ? 'commun.placeholderSelect' : 'commun.placeholderInput'
    );
  }
}
