import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * AlertComponent displays an alert message.
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-content
        class="flex items-center justify-between bg-warn py-0 pr-0 text-white"
      >
        {{ message }}
        <button
          mat-icon-button
          class="close-button"
          (click)="closeAlert.emit()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-content>
    </mat-card>
  `,
})
export class AlertComponent {
  @Input() message: string;
  @Output() closeAlert = new EventEmitter<void>();
}
