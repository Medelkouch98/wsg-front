import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-illustration',
  standalone: true,
  imports: [NgClass, MatIconModule, NgIf],
  template: `
    <span>
      <mat-icon
        *ngIf="status !== null && status !== undefined"
        [ngClass]="status ? 'text-emerald-800' : 'text-warn'"
      >
        {{ status ? 'check_circle' : 'cancel' }}
      </mat-icon>
    </span>
  `,
})
export class StatusIllustrationComponent {
  @Input() public status: boolean;

  isBoolean() {
    return typeof this.status === 'boolean';
  }
}
