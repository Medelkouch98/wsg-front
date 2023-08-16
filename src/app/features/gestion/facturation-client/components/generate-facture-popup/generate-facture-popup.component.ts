import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { CustomDateMaskDirective } from '@app/directives';
import { MatInputModule } from '@angular/material/input';
import { FacturationClientStore } from '../../facturation-client.store';
import { FormControlErrorPipe } from '@app/pipes';
import { Subscription } from 'rxjs';
import { WsErrorClass } from '@app/models';
import { formaterDate } from '@app/helpers';

@Component({
  selector: 'app-generate-facture-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TranslateModule,
    MatButtonModule,
    CustomDateMaskDirective,
    MatInputModule,
    FormControlErrorPipe,
  ],
  templateUrl: './generate-facture-popup.component.html',
})
export class GenerateFacturePopupComponent implements OnInit, OnDestroy {
  public dateFacturationControl = new FormControl<string>(
    '',
    Validators.required
  );
  public dateFacturationError: string;
  private subs: Subscription = new Subscription();
  constructor(
    private facturationClientProStore: FacturationClientStore,
    private dialogRef: MatDialogRef<GenerateFacturePopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { dateFacturation: string }
  ) {}

  ngOnInit() {
    this.dateFacturationControl.setValue(this.data.dateFacturation);
    // Récupérer le message d'erreur pour la date de facturation lors de génération facture
    this.subs.add(
      this.facturationClientProStore.dateFacturationError$.subscribe(
        (dateFacturationError: string) => {
          this.dateFacturationError = dateFacturationError;
        }
      )
    );
  }

  /**
   * Changer date facturation
   */
  public dateChange() {
    this.facturationClientProStore.setErrors(new WsErrorClass());
    this.facturationClientProStore.setDateFacturation(
      this.dateFacturationControl.value !== null
        ? formaterDate(this.dateFacturationControl.value)
        : ''
    );
  }

  /**
   * Générer la facture
   */
  generateFacture() {
    this.facturationClientProStore.generateFacture({
      closeDialog: () => this.dialogRef.close(),
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
