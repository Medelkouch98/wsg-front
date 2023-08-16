import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-no-data-search',
  standalone: true,
  imports: [MatCardModule, NgIf],
  template: `
    <mat-card *ngIf="image || message">
      <mat-card-content>
        <div class="flex flex-col items-center">
          <img [src]="image" [alt]="message" width="200" height="182" />
          <p *ngIf="message" class="font-medium">{{ message }}</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class NoDataSearchComponent {
  @Input() message: string;
  @Input() image: string;
}
