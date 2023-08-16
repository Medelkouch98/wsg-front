import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ITypeLiasse } from '../../models';
import { AGREMENT_CENTRE_PATTERN, NUMBER_LIASSE_PATTERN } from '@app/config';
import { ImprimesActionEnum, ImprimesTypeFormEnum } from '../../enum';
import * as moment from 'moment';
import { ImprimesStore } from '../../imprimes.store';
import { Observable } from 'rxjs';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GlobalValidators } from '../../../../../core/validators';
import { ImprimesFormGroup } from './models';
import { MatCardModule } from '@angular/material/card';
import { select, Store } from '@ngrx/store';
import * as authSelector from '../../../../../core/store/auth/auth.selectors';
import { AppState } from '../../../../../core/store/app.state';
import { ICentre } from '@app/models';
import { map, take } from 'rxjs/operators';
import { PermissionType } from '@app/enums';

@Component({
  selector: 'app-imprimes-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FieldControlLabelDirective,
    TranslateModule,
    NgIf,
    NgFor,
    FormControlNumberOnlyDirective,
    FormControlErrorPipe,
    AsyncPipe,
    CustomDateMaskDirective,
    MatCardModule,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './imprimes-form.component.html',
})
export class ImprimesFormComponent implements OnInit {
  @Input() imprimesTypeForm: ImprimesTypeFormEnum;
  typeLiasses$: Observable<ITypeLiasse[]> = this.imprimesStore.typeLiasses$;
  imprimesForm: FormGroup<ImprimesFormGroup>;
  ImprimesTypeFormEnum = ImprimesTypeFormEnum;
  constructor(
    private fb: FormBuilder,
    private imprimesStore: ImprimesStore,
    private store: Store<AppState>,
    private globalValidators: GlobalValidators
  ) {}

  ngOnInit() {
    this.store
      .pipe(select(authSelector.UserCurrentCentreSelector), take(1))
      .subscribe((centre: ICentre) => {
        this.createForm(centre);
      });

    this.store
      .pipe(
        take(1),
        select(authSelector.AccessPermissionsSelector),
        map(
          (accessPermissions: PermissionType[]) =>
            !accessPermissions.includes(PermissionType.WRITE)
        )
      )
      .subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.imprimesForm.disable();
        }
      });

    // dans le cas d'annuler de liasse ajouter le formcontrol typeliasse
    if (this.imprimesTypeForm === ImprimesTypeFormEnum.cancel) {
      this.imprimesStore.getTypeLiasses();
      this.imprimesForm.addControl(
        'type_liasse_id',
        this.fb.control(null, [Validators.required])
      );
    } else {
      // dans le cas de prete de laisse ajouter l'agrement et la date
      this.imprimesForm.addControl(
        'agrement',
        this.fb.control('', [
          Validators.required,
          Validators.pattern(AGREMENT_CENTRE_PATTERN),
        ])
      );
      this.imprimesForm.addControl(
        'date',
        this.fb.control('', [Validators.required])
      );
    }
  }

  /**
   * Creer le formulaire
   * @param centre ICentre
   * @private
   */
  private createForm(centre: ICentre) {
    this.imprimesForm = this.fb.group(
      {
        premier_numero: new FormControl(null, [
          Validators.required,
          Validators.pattern(NUMBER_LIASSE_PATTERN(centre.type_libelle)),
        ]),
        dernier_numero: new FormControl(null, [
          Validators.required,
          Validators.pattern(NUMBER_LIASSE_PATTERN(centre.type_libelle)),
        ]),
        commentaire: new FormControl(''),
      },
      {
        validators: [
          this.globalValidators.numberRangeValidator(
            'premier_numero',
            'dernier_numero'
          ),
        ],
      }
    );
  }

  /**
   *
   * Automatiquement prérempli le fieldToFill par la valeur de fieldFilled
   * @param fieldToFill string
   * @param fieldFilled string
   */
  preFilledAuto(fieldToFill: string, fieldFilled: string) {
    if (
      this.imprimesForm.get(fieldFilled).value &&
      !this.imprimesForm.get(fieldToFill).value
    ) {
      this.imprimesForm
        .get(fieldToFill)
        .setValue(this.imprimesForm.get(fieldFilled).value);
    }
  }

  /**
   * Annuler ou prêter liasse
   */
  public save() {
    if (this.imprimesForm.controls.date?.value) {
      this.imprimesForm.controls.date.setValue(
        moment(this.imprimesForm.controls.date.value).format('YYYY-MM-DD')
      );
    }
    this.imprimesStore.save({
      imprimesForm: this.imprimesForm.getRawValue(),
      actionType:
        this.imprimesTypeForm === ImprimesTypeFormEnum.cancel
          ? ImprimesActionEnum.annuler
          : ImprimesActionEnum.preter,
    });
  }
}
