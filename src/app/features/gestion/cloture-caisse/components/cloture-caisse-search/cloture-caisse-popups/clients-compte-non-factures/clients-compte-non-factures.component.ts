import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-clients-compte-non-factures',
  standalone: true,
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './clients-compte-non-factures.component.html',
})
export class ClientsCompteNonFacturesComponent {
  constructor(
    private dialogRef: MatDialogRef<ClientsCompteNonFacturesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { count: number }
  ) {}

  emitAction(action: boolean): void {
    this.dialogRef.close(action);
  }

  facturerClientsCompte() {
    //TODO: implement logic once API is ready
  }

  continuer() {
    //TODO: implement logic once API is ready
  }
}
