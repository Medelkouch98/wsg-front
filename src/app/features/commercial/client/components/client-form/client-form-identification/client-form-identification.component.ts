import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ICentre, ICivilite, IClient, IResource } from '@app/models';
import { ClientStore } from '../../../client.store';
import { select, Store } from '@ngrx/store';
import {
  UserCentresSelector,
  UserCurrentCentreSelector,
} from '../../../../../../core/store/auth/auth.selectors';
import { AppState } from '../../../../../../core/store/app.state';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EMAIL_PATTERN, MOBILE_PATTERN, TYPE_CLIENT } from '@app/config';
import {
  CiviliteByTypeAndStateSelector,
  InactifCivilityByIdSelector,
} from '../../../../../../core/store/resources/resources.selector';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '@app/components';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { GlobalHelper } from '@app/helpers';
import { TypePersonneEnum } from '@app/enums';
import {
  CapitalizeFirstLetterDirective,
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormControlErrorPipe } from '@app/pipes';
import { IClientIdentificationFormGroup } from '../../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-client-form-identification',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    ConfirmationPopupComponent,
    FormControlNumberOnlyDirective,
    FieldControlLabelDirective,
    FormControlErrorPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatExpansionModule,
    CapitalizeFirstLetterDirective,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './client-form-identification.component.html',
})
export class ClientFormIdentificationComponent implements OnInit, OnDestroy {
  @Input() addMode: boolean;
  @Input() isReadOnly$: Observable<boolean>;
  typeClient: IResource[] = TYPE_CLIENT.filter(
    (type: IResource) => type.code !== ''
  );
  centres$: Observable<ICentre[]> = this.store.pipe(
    select(UserCentresSelector)
  );
  currentCentre$: Observable<ICentre> = this.store.pipe(
    select(UserCurrentCentreSelector)
  );
  isIdentificationValidated$: Observable<boolean> =
    this.clientStore.isIdentificationValidated$;
  currentInactiveCivilite$: Observable<ICivilite>;
  civilites$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector(TypePersonneEnum.COMPTE))
  );
  client: IClient;
  identificationForm: FormGroup<IClientIdentificationFormGroup>;
  isIdentificationValidated = false;
  typePersonneEnum = TypePersonneEnum;
  isValideClicked = false;
  isClientIdentificationSaved = false;
  numeroAffaire: number;
  private subscription = new Subscription();

  public updateRequiredStatus$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientStore: ClientStore,
    private store: Store<AppState>,
    private matDialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.subscription.add(
      this.isReadOnly$.subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.identificationForm.disable();
        } else {
          this.identificationForm.enable();
        }
        this.identificationForm.get('clientPro.code').disable();
      })
    );
    if (!this.addMode) {
      this.identificationForm.get('type').disable();
    }
    this.subscription.add(
      this.clientStore.client$
        .pipe(
          tap((client: IClient) => {
            this.client = client;
            //ici on initialise par la civilité actuelle inactive dans le cas où un client a une civilité qui n'est plus active
            this.currentInactiveCivilite$ = this.store.pipe(
              select(InactifCivilityByIdSelector(client.civilite_id))
            );
            // Marquer le formulaire as pristine apres la validation du formulaire
            if (this.isValideClicked) {
              this.identificationForm.markAsPristine();
              this.isValideClicked = false;
            }
            // Modifier les valeurs de formulaire lorsqu'on est en mode de modification est le formulaire is pristine
            // pour éviter d'écraser ce qui est saisi au cas le client est modifié au niveau de facturation.
            if (!this.addMode && this.identificationForm.pristine) {
              this.identificationForm.patchValue(client);
            }
          })
        )
        .subscribe()
    );

    this.subscription.add(
      this.currentCentre$.subscribe((currentCentre: ICentre) => {
        this.identificationForm.controls.centres.setValue(null);
        if (currentCentre) {
          this.numeroAffaire = currentCentre.numero_affaire;
          this.identificationForm.controls.centres.setValue([
            currentCentre.numero_affaire,
          ]);
        }
        this.updateRequiredStatus$.next();
      })
    );

    this.subscription.add(
      this.identificationForm.controls.type.valueChanges.subscribe(
        (type: TypePersonneEnum) => {
          this.civilites$ = this.store.pipe(
            select(
              CiviliteByTypeAndStateSelector(
                type === TypePersonneEnum.COMPTE
                  ? TypePersonneEnum.COMPTE
                  : null
              )
            )
          );
          this.identificationForm.controls.civilite_id.reset();
          this.updateRequiredStatus$.next();
        }
      )
    );
    this.subscription.add(
      this.identificationForm.valueChanges
        .pipe(
          withLatestFrom(this.clientStore.isIdentificationValidated$),
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
          this.clientStore.setIsIdentificationValidated(false);
        })
    );
  }

  /**
   * creer le formulaire
   */
  createForm() {
    this.identificationForm = this.fb.group({
      id: [],
      type: [TypePersonneEnum.COMPTE],
      civilite_id: [],
      nom: ['', [Validators.required, Validators.maxLength(40)]],
      adresse: ['', [Validators.required, Validators.maxLength(40)]],
      suite: ['', [Validators.maxLength(40)]],
      cp: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(5)],
      ],
      ville: ['', [Validators.required, Validators.maxLength(40)]],
      fixe: ['', [Validators.pattern(MOBILE_PATTERN)]],
      mobile: ['', [Validators.pattern(MOBILE_PATTERN)]],
      email: ['', [Validators.pattern(EMAIL_PATTERN)]],
      centres: [],
      actif: [true],
      clientPro: this.fb.group({
        code: [null],
        siret: ['', [Validators.maxLength(14)]],
        code_service: ['', [Validators.maxLength(20)]],
        fax: ['', [Validators.pattern(MOBILE_PATTERN)]],
      }),
    });
  }

  /**
   *
   * @param index number
   * @param item ICivilite
   * @return number
   */
  trackById(index: number, item: ICivilite): number {
    return item.id;
  }

  /**
   * filtrer les civilites dans le cas du client pro
   * afficher une popup de confirmation pour changer le type dans le cas ou le formulaire
   * est déja valide
   * client de passage au moment de l'ajout
   * @param event MatSelectChange
   */
  typeClientChange(event: MatSelectChange) {
    if (
      this.identificationForm.controls.type.value == TypePersonneEnum.COMPTE
    ) {
      this.civilites$ = this.store.pipe(
        select(CiviliteByTypeAndStateSelector(2))
      );
    } else {
      this.civilites$ = this.store.pipe(
        select(CiviliteByTypeAndStateSelector())
      );
    }
    if (
      this.client.type == TypePersonneEnum.COMPTE &&
      this.isClientIdentificationSaved
    ) {
      const dialogRef = this.matDialog.open(ConfirmationPopupComponent, {
        data: {
          message: this.translateService.instant(
            'client.msgChangementTypepersonne'
          ),
          deny: this.translateService.instant('commun.annuler'),
          confirm: this.translateService.instant('commun.valider'),
        },
        disableClose: true,
      });
      this.subscription.add(
        dialogRef.afterClosed().subscribe((result: boolean) => {
          if (result) {
            this.clientStore.initDataAfterChangeTypeClient(event.value);
          } else {
            this.identificationForm.controls.type.setValue(
              TypePersonneEnum.COMPTE
            );
            this.updateRequiredStatus$.next();
          }
        })
      );
    }
  }

  /**
   * sauvgarder ou modifier le client
   */
  valider() {
    this.isValideClicked = true;
    // en mode ajout , modifier les infos identification du client dans le store
    if (this.addMode) {
      this.clientStore.setClientIdentification(
        this.identificationForm.getRawValue()
      );
      this.isClientIdentificationSaved = true;
    } else {
      // modifier le client
      let updatedValues = {};
      GlobalHelper.getUpdatedControles(this.identificationForm, updatedValues);
      this.clientStore.updateClient({
        idclient: this.client.id,
        data: updatedValues,
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
