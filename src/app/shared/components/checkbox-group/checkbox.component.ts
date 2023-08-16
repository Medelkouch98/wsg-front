import {
  Component,
  EventEmitter,
  Host,
  Input,
  Output,
  inject,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CheckboxGroupComponent } from './checkbox-group.component';

/**
 * Checkbox component that can be used within CheckboxGroupComponent.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [MatCheckboxModule],
  template: `
    <mat-checkbox
      [checked]="checkboxGroup.isSelected(value)"
      [disabled]="checkboxGroup.isDisabled()"
      (change)="checkboxGroup.toggleValue(value); toggle.emit($event.checked)"
    >
      {{ label }}
    </mat-checkbox>
  `,
})
export class CheckboxComponent {
  @Input() value: string;
  @Input() label: string;
  @Output() toggle = new EventEmitter<boolean>();
  @Host() public checkboxGroup = inject(CheckboxGroupComponent);
}
