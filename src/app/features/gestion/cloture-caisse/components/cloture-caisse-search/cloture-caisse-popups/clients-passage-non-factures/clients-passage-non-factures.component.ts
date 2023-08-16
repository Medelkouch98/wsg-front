import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-clients-passage-non-factures',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule],
  templateUrl: './clients-passage-non-factures.component.html',
})
export class ClientsPassageNonFacturesComponent {
  constructor(
    private dialogRef: MatDialogRef<ClientsPassageNonFacturesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { count: number }
  ) {}

  emitAction(action: boolean): void {
    this.dialogRef.close(action);
  }
}
