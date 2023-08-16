import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { iif, Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/store/app.state';
import {
  IApporteurAffaireLocal,
  IApporteurAffaireNational,
  ICivilite,
} from '@app/models';
import { ApporteurAffaireStore } from '../../../apporteur-affaire.store';
import {
  CiviliteByTypeAndStateSelector,
  CivilitesSelector,
  InactifCivilityByIdSelector,
} from '../../../../../../core/store/resources/resources.selector';
import {
  EMAIL_PATTERN,
  MOBILE_PATTERN,
  TypeApporteurAffaire,
} from '@app/config';
import { filter, first, map, tap, withLatestFrom } from 'rxjs/operators';
import { GlobalHelper } from '@app/helpers';
import {
  CapitalizeFirstLetterDirective,
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { IApporeturAffaireIdentificationFormGroupModel } from './models/apporetur-affaire-identification-form-group.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-apporteur-affaire-identification',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    FormControlNumberOnlyDirective,
    FormControlErrorPipe,
    FieldControlLabelDirective,
    MatRadioModule,
    CapitalizeFirstLetterDirective,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './apporteur-affaire-identification.component.html',
})
export class ApporteurAffaireIdentificationComponent
  implements OnInit, OnDestroy
{
  @Input() typeApporteurAffaire: TypeApporteurAffaire;
  @Input() addMode: boolean = false;
  @Input() isReadOnly$: Observable<boolean>;
  @Output() valid = new EventEmitter<boolean>();
  @Output() title = new EventEmitter<string>(true);
  civilite$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector(2))
  );
  currentInactiveCivilite$: Observable<ICivilite>;
  isIdentificationValidated$: Observable<boolean> =
    this.apporteurAffaireStore.IsIdentificationValidated$;

  apporteurAffaireLocal: IApporteurAffaireLocal;
  identificationForm: FormGroup<IApporeturAffaireIdentificationFormGroupModel>;
  isIdentificationValidated = false;
  isValideClicked = false;
  subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private apporteurAffaireStore: ApporteurAffaireStore,
    public store: Store<AppState>
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.isReadOnly$.subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.identificationForm.disable();
        } else {
          this.identificationForm.enable();
        }
        this.identificationForm.get('code').disable();
      })
    );
    this.subscription.add(
      iif(
        () => this.typeApporteurAffaire === TypeApporteurAffaire.local,
        this.apporteurAffaireStore.ApporteurAffaireLocalSelector$.pipe(
          tap((apporteurAffaireLocal: IApporteurAffaireLocal) => {
            this.apporteurAffaireLocal = apporteurAffaireLocal;
            //ici on initialise par la civilité actuelle inactive dans le cas où un client a une civilité qui n'est plus active
            this.currentInactiveCivilite$ = this.store.pipe(
              select(
                InactifCivilityByIdSelector(apporteurAffaireLocal.civilite_id)
              )
            );
            if (this.isValideClicked) {
              this.identificationForm.markAsPristine();
              this.isValideClicked = false;
            }
            if (!this.addMode && this.identificationForm.pristine) {
              this.identificationForm.patchValue(apporteurAffaireLocal);
            }
            this.emitTitle();
          })
        ),
        this.apporteurAffaireStore.ApporteurAffaireNationalSelector$.pipe(
          tap((apporteurAffaireNational: IApporteurAffaireNational) => {
            this.currentInactiveCivilite$ = this.store.pipe(
              select(
                InactifCivilityByIdSelector(
                  apporteurAffaireNational?.civilite_id
                )
              )
            );
            this.identificationForm.patchValue(apporteurAffaireNational);
            this.emitTitle();
          })
        )
      ).subscribe()
    );

    this.subscription.add(
      this.identificationForm.valueChanges
        .pipe(
          withLatestFrom(this.apporteurAffaireStore.IsIdentificationValidated$),
          tap(
            ([, isIdentificationValidated]: [any, boolean]) =>
              (this.isIdentificationValidated = isIdentificationValidated)
          ),
          filter(
            ([, isIdentificationValidated]: [any, boolean]) =>
              isIdentificationValidated && this.identificationForm.dirty
          )
        )
        .subscribe(() => {
          this.apporteurAffaireStore.SetIsIdentificationValidated(false);
        })
    );
  }

  /**
   * creation d'ajout d'apporteur
   */
  private createForm() {
    this.identificationForm = this.fb.group({
      id: [],
      civilite_id: [],
      nom: ['', [Validators.required, Validators.maxLength(40)]],
      code: [],
      adresse: ['', [Validators.required, Validators.maxLength(40)]],
      suite: ['', Validators.maxLength(40)],
      cp: ['', Validators.maxLength(5)],
      ville: ['', Validators.maxLength(40)],
      fixe: ['', [Validators.pattern(MOBILE_PATTERN)]],
      email: ['', Validators.pattern(EMAIL_PATTERN)],
      fax: ['', [Validators.pattern(MOBILE_PATTERN)]],
      mobile: ['', [Validators.pattern(MOBILE_PATTERN)]],
      actif: [true],
      type: [],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * sauvgarder ou modifier l'identification de l'apporteur
   */
  valider() {
    this.isValideClicked = true;
    if (this.addMode) {
      this.apporteurAffaireStore.SetApporteurAffaireIdentification(
        this.identificationForm.getRawValue()
      );
    } else {
      // modifier le contact
      let updatedValues = {};
      GlobalHelper.getUpdatedControles(this.identificationForm, updatedValues);
      //mode update : on fait un patch directement
      this.apporteurAffaireStore.UpdateApporteurAffaire({
        apporteurId: this.apporteurAffaireLocal.id,
        data: updatedValues,
      });
    }
  }

  emitTitle() {
    const data = this.identificationForm.value;
    this.subscription.add(
      this.store
        .select(CivilitesSelector)
        .pipe(
          map((civilites: ICivilite[]) =>
            civilites?.find(
              (civilite: ICivilite) => civilite?.id === data?.civilite_id
            )
          ),
          first()
        )
        .subscribe((civilite: ICivilite) => {
          let title = civilite ? `${civilite?.libelle_complet} : ` : '';
          this.title.emit(`${title}${data?.nom}`);
        })
    );
  }
}
