import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ISimpleFacture } from '../../../models';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '@app/services';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-factures-popup',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule, NgForOf],
  templateUrl: './factures-popup.component.html',
})
export class FacturesPopupComponent {
  constructor(
    private dialogRef: MatDialogRef<FacturesPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISimpleFacture[],
    private sharedService: SharedService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  /**
   * ouvrir la facture dans une nouvelle fenêtre
   * @param {ISimpleFacture} facture
   */
  openFactureDetails(facture: ISimpleFacture) {
    this.sharedService.redirectToNewTab(['p/gestion/factures', facture.id]);
  }
}
