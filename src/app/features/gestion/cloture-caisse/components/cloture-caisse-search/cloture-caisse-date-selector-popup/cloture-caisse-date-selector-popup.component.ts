import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  CustomDateMaskDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControlErrorPipe } from '@app/pipes';
import { NgIf } from '@angular/common';
import {
  IClotureCaisseActionsFormGroup,
  IClotureCaisseSearchResponse,
} from '../../../models';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { sameYearAndMonthValidator } from '../../../validators/cloture-caisse.validator';
import * as moment from 'moment';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';

@Component({
  selector: 'app-cloture-caisse-date-selector-popup',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDatepickerModule,
    CustomDateMaskDirective,
    FormControlErrorPipe,
    NgIf,
    FormControlErrorDirective,
    MatDialogModule,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './cloture-caisse-date-selector-popup.component.html',
})
export class ClotureCaisseDateSelectorPopupComponent implements OnInit {
  public clotureForm: FormGroup<IClotureCaisseActionsFormGroup>;
  minDate: Date;
  maxDate: Date = new Date();
  verificationInProgress: boolean = false;
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private clotureCaisseStore: ClotureCaisseStore,
    private dialogRef: MatDialogRef<ClotureCaisseDateSelectorPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IClotureCaisseSearchResponse
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (!!this.data?.date_fin) {
      const date = moment(this.data.date_fin).add(1, 'day').toDate();
      this.clotureForm.controls.date_debut.patchValue(date);
      this.clotureForm.controls.date_debut.markAsDirty();
      this.minDate = date;
    }
  }

  /**
   * Créer le formulaire de demande de cloture
   */
  private createForm(): void {
    this.clotureForm = this.fb.group<IClotureCaisseActionsFormGroup>(
      {
        date_debut: new FormControl(null, Validators.required),
        date_fin: new FormControl(null, Validators.required),
      },
      {
        validators: [sameYearAndMonthValidator()],
      }
    );
  }

  /**
   * verifier avant de continuer vers la cloture
   */
  public verify(): void {
    this.verificationInProgress = true;
    //verifier si on peut faire la cloture ou non
    this.clotureCaisseStore.verifyClotureCaisse({
      data: this.clotureForm.getRawValue(),
      canCloture: () => this.beginCloture(),//la méthode à exécuter si on peut faire la cloture
      cantCloture: () => {
        //si on ne peut pas cloturer, on ajoute l'erreur clotureExist
        this.clotureForm.controls.date_debut.setErrors({ clotureExist: true });
      },
      verificationFinished: () => {
        //après la vérification, on réactive le bouton de cloture
        this.verificationInProgress = false;
      },
    });
  }

  /**
   * on commence l'initialisation du cloture
   * 1- fermer le popup
   * 2- initializer les données de cloture
   * 3- redirection vers la page de cloture
   */
  private beginCloture() {
    this.closeDialog();
    this.clotureCaisseStore.initClotureRequest(this.clotureForm.getRawValue());
    this.goToClotureCaisseForm();
  }

  /**
   * fermer le popup
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * ouvrir le formulaire de clôture de caisse
   */
  private goToClotureCaisseForm(): void {
    //TODO: call conditions to show popups and settings once the APIs are ready
    this.clotureCaisseStore.goToClotureCaisseForm();
  }
}
