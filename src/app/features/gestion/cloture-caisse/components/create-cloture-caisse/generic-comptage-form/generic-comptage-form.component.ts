import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, tap } from 'rxjs/operators';
import { ConfirmationPopupComponent } from '@app/components';
import { FormControlErrorPipe } from '@app/pipes';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MarkRequiredFormControlAsDirtyDirective } from '@app/directives';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import {
  Comptage,
  ComptageRowForm,
  IComptage,
  IComptageFormGroup,
  IComptageRowForm,
} from '../../../models';
import { TypeComptageEnum } from '../../../enums';
import { DECIMAL_NUMBER_PIPE_FORMAT, POSITIVE_INTEGER } from '@app/config';
import { FacturesPopupComponent } from '../factures-popup/factures-popup.component';

@Component({
  selector: 'app-generic-comptage-form',
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MarkRequiredFormControlAsDirtyDirective,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    FormControlErrorPipe,
    MatIconModule,
    DecimalPipe,
  ],
  templateUrl: './generic-comptage-form.component.html',
})
export class GenericComptageFormComponent implements OnInit, OnDestroy {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  @Input() columnsMap: Map<string, string>;
  public dataSource = new MatTableDataSource<FormGroup<IComptageRowForm>>();
  @Input() form: FormGroup<IComptageFormGroup>;
  @Input() typeComptage: TypeComptageEnum;
  public comptages: IComptage[] = [];
  public subscription: Subscription = new Subscription();
  public updateRequiredStatus$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private clotureCaisseStore: ClotureCaisseStore,
    private matDialog: MatDialog,
    private translateService: TranslateService
  ) {}

  /**
   * retourner les colonnes
   * @return {string[]}
   */
  getColumns(): string[] {
    return Array.from(this.columnsMap.keys());
  }

  ngOnInit(): void {
    this.subscription.add(
      this.clotureCaisseStore
        .clotureCaisseRequestComptagesByType$(this.typeComptage)
        .subscribe((comptages: IComptage[]) => {
          this.comptages = comptages;
          const formValues = this.comptageRowsForm().getRawValue(); //les valeurs du formulaire y compris les valeurs temporaires (pas encore dans le store)
          this.comptageRowsForm().clear();
          this.dataSource = new MatTableDataSource();

          const comptagesToFill = !!formValues?.length ? formValues : comptages;
          comptagesToFill.forEach((comptage: IComptage) => {
            this.fillComptageForm(comptage);
          });
          //pour notifier la directive appMarkRequiredFormControlAsDirty
          this.updateRequiredStatus$.next();
        })
    );
  }

  /**
   * Remplir la liste des comptages
   * @param data IComptage
   * @param pushAtBeginning boolean
   */
  fillComptageForm(data: IComptage, pushAtBeginning: boolean = false) {
    const formGroup: FormGroup<IComptageRowForm> =
      this.fb.group<IComptageRowForm>(
        new ComptageRowForm(new Comptage(data.type))
      );
    formGroup.patchValue(data);
    if (pushAtBeginning) {
      this.dataSource.data.unshift(formGroup);
      this.comptageRowsForm().insert(0, formGroup);
    } else {
      this.dataSource.data.push(formGroup);
      this.comptageRowsForm().push(formGroup);
    }
  }

  /**
   * get comptage Rows form
   * @return FormArray
   */
  comptageRowsForm(): FormArray<FormGroup<IComptageRowForm>> {
    return this.form.controls.comptageRowsForm;
  }

  /**
   * ajouter une nouvelle ligne dans le tableau
   */
  addNewRow(): void {
    this.fillComptageForm(new Comptage(this.typeComptage), true);
    this.clotureCaisseStore.addNewComptage(this.typeComptage);
  }

  /**
   * permet d'activer le champ de sélection pour l'édition
   * @param {FormGroup<IComptageRowForm>} element
   * @param {number} index
   */
  editRow(element: FormGroup<IComptageRowForm>, index: number): void {
    element.controls.isEditable.patchValue(true);
  }

  /**
   * Ajouter ou modifier le comptage
   * @param {FormGroup<IComptageRowForm>} element
   * @param {number} index
   */
  saveRow(element: FormGroup<IComptageRowForm>, index: number): void {
    const comptage: IComptage = element.getRawValue();

    element.controls.isEditable.patchValue(false);
    element.controls.isNew.patchValue(false);

    comptage.isEditable = false;
    comptage.isNew = false;
    this.clotureCaisseStore.addOrUpdateComptage({
      comptage,
      index,
      type: this.typeComptage,
    });
  }

  /**
   * Supprimer comptage
   * @param {FormGroup<IComptageRowForm>} element
   * @param {number} index
   */
  deleteRow(element: FormGroup<IComptageRowForm>, index: number): void {
    const dialogRef = this.matDialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('commun.deleteConfirmation'),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });
    this.subscription.add(
      dialogRef
        .afterClosed()
        .pipe(
          filter((result: boolean) => !!result),
          tap(() => {
            this.form.controls.comptageRowsForm.removeAt(index);
            this.clotureCaisseStore.removeComptage({
              index,
              type: this.typeComptage,
            });
          })
        )
        .subscribe()
    );
  }

  /**
   * Annuler les changements
   * @param {FormGroup<IComptageRowForm>} element
   * @param {number} index
   */
  cancelChanges(element: FormGroup<IComptageRowForm>, index: number): void {
    const comptage: IComptage = element.getRawValue();
    if (!!comptage.isNew) {
      //si l'élément est nouveau, on le supprime
      this.form.controls.comptageRowsForm.removeAt(index);
      this.clotureCaisseStore.removeComptage({
        index,
        type: this.typeComptage,
      });
    } else {
      //et s'il existe, on remet l'ancienne valeur
      this.comptages[index].isEditable = false;
      // remplacer la ligne par les données initiales
      element.patchValue(this.comptages[index]);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * ouvrir le pop contenant les factures associées
   * @param {FormGroup<IComptageRowForm>} element
   */
  showFactures(element: FormGroup<IComptageRowForm>) {
    const comptage: IComptage = element.getRawValue();
    if (comptage?.factures && comptage?.factures?.length > 0) {
      this.matDialog.open(FacturesPopupComponent, {
        data: comptage.factures,
        disableClose: true,
      });
    }
  }
}
