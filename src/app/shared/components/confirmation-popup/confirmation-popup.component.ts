import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { IConfirmData } from '@app/models';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-popup',
  standalone: true,
  imports: [MatButtonModule, NgFor, NgIf, MatDialogModule],
  templateUrl: './confirmation-popup.component.html',
})
export class ConfirmationPopupComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmData
  ) {}

  emitAction(action: boolean): void {
    this.dialogRef.close(action);
  }
}
