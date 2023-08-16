import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MarkRequiredFormControlAsDirtyDirective } from '@app/directives';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import {
  IComptage,
  IComptageFormGroup,
  IComptageRowForm,
} from '../../../models';
import { TypeComptageEnum } from '../../../enums';
import { DECIMAL_NUMBER_PIPE_FORMAT, POSITIVE_INTEGER } from '@app/config';

@Component({
  selector: 'app-comptage-des-especes',
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
  templateUrl: './comptage-des-especes.component.html',
})
export class ComptageDesEspecesComponent implements OnInit, OnDestroy {
  TypeComptageEnum = TypeComptageEnum;
  @Input() form: FormGroup<IComptageFormGroup>;
  @Input() typeEspece:
    | TypeComptageEnum.TYPE_ESPECE_PIECE
    | TypeComptageEnum.TYPE_ESPECE_BILLET;
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public columns: string[] = ['valeur', 'nombre', 'montant'];
  public dataSource = new MatTableDataSource<FormGroup<IComptageRowForm>>();
  public subscription: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder,
    private clotureCaisseStore: ClotureCaisseStore
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.clotureCaisseStore
        .clotureCaisseRequestComptagesByType$(this.typeEspece)
        .subscribe((comptages: IComptage[]) => {
          this.dataSource = new MatTableDataSource();
          this.form.controls.comptageRowsForm.clear();
          if (comptages?.length > 0) {
            this.form.controls.comptageRowsForm = this.fb.array(
              [] as FormGroup<IComptageRowForm>[]
            );
            comptages.forEach((comptage: IComptage) =>
              this.fillComptageForm(comptage)
            );
            this.dataSource = new MatTableDataSource(
              this.comptageEspecesRowsForm().controls
            );
          }
          this.form.enable();
        })
    );
  }

  /**
   * Remplir la liste des comptages
   * @param data IComptage
   */
  fillComptageForm(data: IComptage) {
    const formGroup: FormGroup<IComptageRowForm> =
      this.fb.group<IComptageRowForm>({
        type: new FormControl<TypeComptageEnum>(data.type),
        valeur: new FormControl<number>(data.valeur),
        nombre: new FormControl<number>(data.nombre, [
          Validators.required,
          Validators.pattern(POSITIVE_INTEGER),
        ]),
        montant: new FormControl<number>(data.montant, [
          Validators.required,
          Validators.min(0),
        ]),
        nom: new FormControl<string>(data.nom),
        numero: new FormControl<number>(data.numero),
        banque: new FormControl<string>(data.banque),
      });
    this.comptageEspecesRowsForm().push(formGroup);
  }

  /**
   * get comptage Rows form
   * @return FormArray
   */
  comptageEspecesRowsForm(): FormArray<FormGroup<IComptageRowForm>> {
    return this.form.controls.comptageRowsForm;
  }

  /**
   * modifier le comptage
   * @param {FormGroup<IComptageRowForm>} element
   * @param {number} index
   */
  saveRow(element: FormGroup<IComptageRowForm>, index: number): void {
    const comptage: IComptage = element.getRawValue();
    if (comptage.nombre) {
      comptage.montant = comptage.nombre * comptage.valeur;
    } else {
      comptage.montant = 0;
    }
    this.clotureCaisseStore.addOrUpdateComptage({
      comptage,
      index,
      type: this.typeEspece,
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
