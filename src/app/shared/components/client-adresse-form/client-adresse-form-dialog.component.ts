import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ClientAdresseFormComponent } from './client-adresse-form.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IClient } from '@app/models';
import { IAdresseFormDialogData } from './models';

@Component({
  selector: 'app-client-adresse-form-dialog',
  template: `
    <mat-dialog-content>
      <app-client-adresse-form
        [showPassage]="data.showPassage"
        [formControl]="clientControl"
        [typePersonne]="data.typePersonne"
      ></app-client-adresse-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="cancel()">
        {{ 'commun.annuler' | translate }}
      </button>
      <button
        mat-raised-button
        [disabled]="!clientControl.value"
        color="primary"
        [mat-dialog-close]="true"
      >
        {{ 'commun.valider' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    ClientAdresseFormComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
})
export class ClientAdresseFormDialogComponent implements OnInit {
  public clientControl = new FormControl<IClient>(null);
  public intialClient: IClient;
  constructor(
    public dialogRef: MatDialogRef<ClientAdresseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAdresseFormDialogData
  ) {}

  ngOnInit() {
    this.intialClient = this.data.clientControl.value;
    this.clientControl = this.data.clientControl;
  }

  /**
   * Annuler la modification du client
   */
  cancel() {
    this.clientControl.setValue(this.intialClient);
    this.dialogRef.close(false);
  }
}
