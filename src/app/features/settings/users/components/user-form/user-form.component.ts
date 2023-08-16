import { MatCardModule } from '@angular/material/card';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { PermissionType } from '@app/enums';
import { UsersStore } from '../../users.store';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../core/store/app.state';
import {
  filter,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  IDesactivationMotif,
  IRNC2User,
  IUserFormGroup,
  IControleurFormGroup,
  IUserFormGroupValue,
} from '../../models';
import {
  IRole,
  ICivilite,
  ICentre,
  IControleur,
  IUser,
  Controleur,
  IWsError,
  ICurrentUser,
} from '@app/models';
import {
  RolesSelector,
  CiviliteByTypeAndStateSelector,
} from '../../../../../core/store/resources/resources.selector';

import {
  AccessPermissionsSelector,
  UserCentresSelector,
  UserCurrentCentreSelector,
  UserSelector,
} from '../../../../../core/store/auth/auth.selectors';
import * as moment from 'moment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InactivityReasonPopupComponent } from './inactivity-reason-popup/inactivity-reason-popup.component';
import {
  CustomDateMaskDirective,
  FieldControlLabelDirective,
  FormControlErrorDirective,
  FormControlNumberOnlyDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { GlobalHelper } from '@app/helpers';
import {
  AGREMENT_CONTROLEUR_PATTERN,
  EMAIL_PATTERN,
  MOBILE_PATTERN,
} from '@app/config';
import { UniqueValidator } from '../../../../../core/validators';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { SharedService } from '@app/services';

const USER_CENTRES_TABLE_COLUMNS = ['centre', 'role'];
const CONTROLEUR_CENTRES_TABLE_COLUMNS = [
  ...USER_CENTRES_TABLE_COLUMNS,
  'isControleur',
];

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    NgClass,
    TranslateModule,
    ReactiveFormsModule,
    InactivityReasonPopupComponent,
    CustomDateMaskDirective,
    FormControlNumberOnlyDirective,
    FieldControlLabelDirective,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatDialogModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatCardModule,
    MarkRequiredFormControlAsDirtyDirective,
    FormControlErrorDirective,
  ],
  providers: [UniqueValidator],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  public usersStore = inject(UsersStore);
  public store = inject(Store<AppState>);
  public router = inject(Router);
  private translateService = inject(TranslateService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);
  private uniqueValidator = inject(UniqueValidator);
  private sharedService = inject(SharedService);

  @Input() addMode: boolean;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  public isAddRoleGranted$: Observable<boolean> =
    this.usersStore.isAddRoleGranted$;
  private user$: Observable<IUser> = this.usersStore.user$;

  public roles$: Observable<IRole[]> = this.store
    .pipe(select(RolesSelector))
    .pipe(
      tap(
        (roles) =>
          (this.controleurRole = roles.find(
            ({ slug }) => slug === 'controleur'
          ))
      )
    );
  public civilites$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector(1))
  );
  public centres$: Observable<ICentre[]> = this.store.pipe(
    select(UserCentresSelector)
  );

  public currentCentre$: Observable<ICentre> = this.store.pipe(
    select(UserCurrentCentreSelector)
  );

  public currentUser$: Observable<ICurrentUser> = this.store
    .pipe(select(UserSelector))
    .pipe(tap((user) => (this.currentUser = user)));
  public rnc2User$: Observable<IRNC2User | null> = this.usersStore.rnc2User$;
  public errors$: Observable<IWsError> = this.usersStore.errors$;
  private desactivationMotifs$: Observable<IDesactivationMotif[]> =
    this.usersStore.desactivationMotifs$;
  private desactivationMotifs: IDesactivationMotif[];

  public updateRequiredStatus$ = new Subject<void>();
  public currentUser: ICurrentUser;
  public userForm: FormGroup<IUserFormGroup>;
  private subscriptions = new Subscription();
  public agrementVlChangeSubscription: Subscription;
  public currentCentreId: number;
  public centres: ICentre[];
  public centresTableColumns = USER_CENTRES_TABLE_COLUMNS;
  private controleurRole: IRole;

  ngOnInit(): void {
    /**
     * Sets up the form with the user's information.
     * Disables the form if the user is read-only, and switches to another observable when the `isControleur` flag of the user changes.
     */
    const isControleurSub = this.user$
      .pipe(
        withLatestFrom(this.isReadOnly$, this.centres$),
        filter(([user]) => this.addMode || !!user.id),
        tap(([user, isReadOnly, centres]: [IUser, boolean, ICentre[]]) => {
          this.centres = centres;
          this.initForm(user, centres);
          isReadOnly && this.userForm.disable();
        }),
        switchMap(([user, _, centres]) =>
          this.onIsControleurChange(user, centres)
        )
      )
      .subscribe();

    /**
     * Updates the RNC2 fields in the form accordingly.
     * It also initializes the `rnc2User` object in the store.
     */
    const rnc2UserSub = this.rnc2User$
      .pipe(
        filter((rnc2User: IRNC2User | null) => !!rnc2User),
        tap((rnc2User) => {
          this.updateRNC2Fields(rnc2User);
          this.usersStore.initRNC2User();
        })
      )
      .subscribe();

    /**
     * Update the form controls based on the new value.
     */
    const currentCentreSub = this.currentCentre$.subscribe(
      (currentCentre: ICentre) => {
        if (!currentCentre) return;
        this.currentCentreId = currentCentre.id;
        if (this.addMode) {
          this.centres.forEach((centre, index) => {
            const isCurrentCentre = centre.id === currentCentre.id;
            const centreForm = this.userForm?.controls.centres.controls[index];
            const centreControleurForm =
              this.controleurForm?.controls.centres_controle.controls[index];

            centreForm.patchValue({ id: isCurrentCentre });

            if (isCurrentCentre) {
              centreForm.controls.role_id.enable();
              centreControleurForm?.enable();
            } else {
              centreForm.controls.role_id.disable();
              centreControleurForm?.disable();
            }

            centreControleurForm?.setValue(isCurrentCentre);
          });
        }
      }
    );

    /**
     * Subscription to handle errors related to RNC2 user information.
     */
    const rnc2ErrorSub = this.errors$
      .pipe(
        filter((error: IWsError) => error.message.includes('rnc2-infos')),
        tap(() => this.resetRNC2Fields())
      )
      .subscribe();

    /**
     * Emits an array of IDesactivationMotif objects.
     */
    this.desactivationMotifs$
      .pipe(
        filter((motifs: IDesactivationMotif[]) => !!motifs.length),
        take(1)
      )
      .subscribe(
        (motifs: IDesactivationMotif[]) => (this.desactivationMotifs = motifs)
      );

    this.subscriptions.add(isControleurSub);
    this.subscriptions.add(rnc2UserSub);
    this.subscriptions.add(currentCentreSub);
    this.subscriptions.add(rnc2ErrorSub);
    this.usersStore.getAddRolePermission();
  }

  /**
   * Initializes the user form group.
   * @param {IUser} user - The user object to populate the form with.
   * @param {ICentre[]} centres - An array of centres to populate the form with.
   */
  private initForm(user: IUser, centres: ICentre[]): void {
    const userForm: IUserFormGroup = {
      nom: new FormControl(
        { value: user.nom, disabled: user.is_controleur },
        { validators: [Validators.required, Validators.maxLength(40)] }
      ),
      prenom: new FormControl(
        { value: user.prenom, disabled: user.is_controleur },
        { validators: [Validators.required, Validators.maxLength(40)] }
      ),
      email: new FormControl(user.email, [
        Validators.required,
        Validators.pattern(EMAIL_PATTERN),
      ]),
      civilite_id: new FormControl(user.civilite_id),
      centres: this.fb.array(
        centres.map((centre: ICentre) => {
          const centreForm = user.centres.find(({ id }) => centre.id === id);
          const role_id =
            centreForm?.role_id ??
            (user.is_controleur ? this.controleurRole?.id : null);
          return this.fb.group({
            id: new FormControl(!!centreForm?.id),
            role_id: new FormControl(role_id, Validators.required),
          });
        })
      ),
      login: new FormControl(user.login, {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(40),
        ],
        asyncValidators: this.uniqueValidator.uniqueLogin(user.login),
        updateOn: 'blur',
      }),
      actif: new FormControl(user.actif),
      mobile: new FormControl(user.mobile, Validators.pattern(MOBILE_PATTERN)),
      is_controleur: new FormControl({
        value: user.is_controleur,
        disabled: !!user.id,
      }),
      desactivation_motif_id: new FormControl(user.desactivation_motif_id),
      desactivation_motif_text: new FormControl(user.desactivation_motif_text),
    };

    if (user.is_controleur) {
      const controleur = user.controleur || new Controleur();
      userForm.controleur = this.initControleurForm(controleur, centres);
    }
    this.userForm = this.fb.group(userForm);

    if (!this.addMode) {
      this.userForm.value.centres.forEach((centreForm, index) =>
        this.updateUserAttachedCentres(centreForm.id, index)
      );
      if (!user.actif) {
        this.userForm.controls.centres.disable();
        this.controleurForm?.controls.centres_controle.disable();
      }
    }
  }

  /**
   * Initializes the form group for the Controleur object.
   * @param {Controleur} controleur - The Controleur object to initialize the form with.
   * @param {ICentre[]} centres - The ICentre array to use when initializing the centres_controle form array.
   * @returns {FormGroup<IControleurFormGroup>} The initialized FormGroup object.
   */
  private initControleurForm(
    controleur: Controleur,
    centres: ICentre[]
  ): FormGroup<IControleurFormGroup> {
    this.centresTableColumns = CONTROLEUR_CENTRES_TABLE_COLUMNS;
    return this.fb.group({
      agrement_vl: new FormControl(
        { value: controleur.agrement_vl, disabled: !!controleur.agrement_vl },
        {
          validators: [
            Validators.required,
            Validators.pattern(AGREMENT_CONTROLEUR_PATTERN),
          ],
          asyncValidators: this.uniqueValidator.uniqueAgrement(),
          updateOn: 'blur',
        }
      ),
      centres_controle: this.fb.array(
        centres.map(
          (centre) =>
            new FormControl(controleur.centres_controle.includes(centre.id))
        )
      ),
      agrement_centre_rattachement: new FormControl({
        value: controleur.agrement_centre_rattachement,
        disabled: true,
      }),
      date_debut_agrement: new FormControl<Date | string>(
        {
          value: controleur.date_debut_agrement
            ? new Date(controleur.date_debut_agrement)
            : null,
          disabled: true,
        },
        Validators.required
      ),
      date_fin_agrement: new FormControl<Date | string>({
        value: controleur.date_fin_agrement
          ? new Date(controleur.date_fin_agrement)
          : null,
        disabled: true,
      }),
      adresse: new FormControl(controleur.adresse, Validators.maxLength(40)),
      suite: new FormControl(controleur.suite, Validators.maxLength(40)),
      cp: new FormControl(controleur.cp, Validators.maxLength(5)),
      ville: new FormControl(controleur.ville, Validators.maxLength(40)),
      habilitation_gaz: new FormControl({
        value: controleur.habilitation_gaz,
        disabled: true,
      }),
      habilitation_electrique: new FormControl(
        controleur.habilitation_electrique
      ),
      reset_password: new FormControl(controleur.reset_password),
    });
  }

  /**
   * Returns the `FormGroup` for the `controleur` sub-form of the `userForm`.
   * @returns {FormGroup<IControleurFormGroup>}.
   */
  public get controleurForm(): FormGroup<IControleurFormGroup> {
    return this.userForm.controls.controleur;
  }

  /**
   * Add or remove the controleur form group based on the value of the 'is_controleur' control.
   * @param user The user object containing the controleur information.
   * @param centres The list of centres to be displayed in the form.
   * @returns An observable of the "is_controleur" value.
   */

  private onIsControleurChange(
    user: IUser,
    centres: ICentre[]
  ): Observable<boolean> {
    return this.userForm.controls.is_controleur.valueChanges.pipe(
      tap((isControleur: boolean) => {
        if (isControleur) {
          this.addControleurForm(user.controleur, centres);
        } else {
          this.removeControleurForm();
        }
        this.updateRequiredStatus$.next();
      })
    );
  }

  /**
   * Adds a controleur form to the user form with the given controleur and centres.
   * @param {IControleur} [controleur=new Controleur()] - The controleur object to populate the form with.
   * @param {ICentre[]} centres - The list of centres to populate the form with.
   */
  private addControleurForm(
    controleur: IControleur = new Controleur(),
    centres: ICentre[]
  ): void {
    const controleurForm = this.initControleurForm(controleur, centres);
    this.userForm.addControl('controleur', controleurForm);
    if (this.addMode) {
      centres.forEach((centre, index) => {
        const isCurrentCentre = centre.id === this.currentCentreId;
        this.controleurForm?.controls.centres_controle?.controls[
          index
        ].setValue(isCurrentCentre);
      });
    }
    this.userForm.value.centres.forEach((centreForm, index) =>
      this.updateUserAttachedCentres(centreForm.id, index)
    );
    this.userForm.controls.nom.disable();
    this.userForm.controls.prenom.disable();
    this.userForm.controls.nom.reset();
    this.userForm.controls.prenom.reset();

    this.agrementVlChangeSubscription =
      this.controleurForm?.controls.agrement_vl.statusChanges.subscribe(
        (status) =>
          status === 'VALID' &&
          this.usersStore.getRNC2User(this.controleurForm.value.agrement_vl)
      );
  }

  /**
   * Removes the "controleur" form group from the main user form.
   * Restores 'nom' and 'prenom' controls to their default state.
   */
  private removeControleurForm(): void {
    this.centresTableColumns = USER_CENTRES_TABLE_COLUMNS;
    this.userForm.removeControl('controleur');
    this.userForm.controls.nom.enable();
    this.userForm.controls.prenom.enable();
    this.userForm.controls.nom.reset();
    this.userForm.controls.prenom.reset();
    this.userForm.value.centres.forEach((centreForm, index) =>
      this.updateUserAttachedCentres(centreForm.id, index)
    );
    this.agrementVlChangeSubscription.unsubscribe();
  }

  /**
   * Transforms the user form value into an IUser or Partial<IUser> object.
   * @param userFormValue - The user form value.
   * @returns {IUser | Partial<IUser>}.
   */
  private user(
    userFormValue: IUserFormGroupValue | Partial<IUserFormGroupValue>
  ): IUser | Partial<IUser> {
    let controleur: IControleur;
    if (this.userForm.getRawValue().is_controleur) {
      const controleurFormValue = userFormValue.controleur;
      controleur = controleurFormValue && {
        ...controleurFormValue,
        ...(controleurFormValue.centres_controle && {
          centres_controle: this.controleurAttachedCentres,
        }),
        ...(controleurFormValue.date_debut_agrement && {
          date_debut_agrement: moment(
            controleurFormValue?.date_debut_agrement
          ).format('YYYY-MM-DD'),
        }),

        ...(controleurFormValue.date_fin_agrement && {
          date_fin_agrement: moment(
            controleurFormValue.date_fin_agrement
          ).format('YYYY-MM-DD'),
        }),
      };
    }
    return {
      ...userFormValue,
      ...(userFormValue.centres && { centres: this.userAttachedCentres }),
      ...(controleur && { controleur }),
    };
  }

  /**
   * Saves the user by adding or updating the user depending on the current mode (add or edit).
   */
  public saveUser(): void {
    if (this.addMode) {
      const userFormValue: IUserFormGroupValue = this.userForm.getRawValue();
      const user = this.user(userFormValue) as IUser;
      this.usersStore.addUser(user);
    } else {
      const userFormValue: Partial<IUserFormGroupValue> =
        GlobalHelper.getDirtyValues(this.userForm);
      const user: Partial<IUser> = this.user(userFormValue);
      this.usersStore.updateUser(user);
    }
  }

  /**
   * Checks if the current user form is valid and has been changed by the user.
   * Also checks if there is at least one centre selected.
   * @returns {boolean}
   */
  public isValid(): boolean {
    return (
      this.userForm?.dirty &&
      this.userForm?.valid &&
      !!this.userAttachedCentres.length
    );
  }

  /**
   * Updates the fields of the user form with the data from the RNC2 user.
   * Allows the user to enter a value for the nom or prenom if it was not provided in the RNC2 user.
   * Marks fields as dirty to ensure that their values are sent in the payload of edit mode.
   * @param {IRNC2User} userRNC2 - The RNC2 user data to be used to update the form fields.
   *
   */
  private updateRNC2Fields(userRNC2: IRNC2User): void {
    this.userForm.patchValue({
      nom: userRNC2.nom,
      prenom: userRNC2.prenom,
      controleur: {
        date_debut_agrement: userRNC2.date_debut_agrement,
        date_fin_agrement: userRNC2.date_fin_agrement,
        agrement_centre_rattachement: userRNC2.agrement_centre_rattachement,
        habilitation_gaz: userRNC2.habilitation_gaz_vl,
      },
    });
    !userRNC2.nom && this.userForm.controls.nom.enable();
    userRNC2.nom && this.userForm.controls.nom.disable();
    !userRNC2.prenom && this.userForm.controls.prenom.enable();
    userRNC2.prenom && this.userForm.controls.prenom.disable();
    // Marks fields as dirty to ensure that their values are sent in the payload of edit mode.
    this.userForm.controls.nom.markAsDirty();
    this.userForm.controls.prenom.markAsDirty();
    this.controleurForm.controls.date_debut_agrement.markAsDirty();
    this.controleurForm.controls.date_fin_agrement.markAsDirty();
    this.controleurForm.controls.agrement_centre_rattachement.markAsDirty();
    this.controleurForm.controls.habilitation_gaz.markAsDirty();
    this.toastr.info(
      this.translateService.instant('users.updateRNC2FieldsInfoMessage')
    );
  }

  /**
   * Resets the form fields for the RNC2 user.
   */
  private resetRNC2Fields(): void {
    this.userForm.controls.nom.reset();
    this.userForm.controls.prenom.reset();
    this.controleurForm.controls.date_debut_agrement.reset();
    this.controleurForm.controls.date_fin_agrement.reset();
    this.controleurForm.controls.agrement_centre_rattachement.reset();
    this.controleurForm.controls.habilitation_gaz.reset();
    this.updateRequiredStatus$.next();
  }

  /**
   * Handles the change event of a 'centres_controle' checkbox.
   * If at least one checkbox is checked, resets the inactivity reason form controls.
   * Otherwise, opens a popup to select an inactivity reason.
   * @param {number} index - The index of the 'centres_controle' checkbox that was changed.
   */
  public updateControleurAttachedCentres(index: number): void {
    if (this.controleurAttachedCentres?.length) {
      this.resetInactivityReason();
      return;
    }
    if (this.currentUser.hasFullGroupAccess) {
      this.popUpInactivityReason(index);
    }
  }

  /**
   * Enables or disables the 'role_id' and 'centres_controle' form controls for a centre based on a checkbox state.
   * @param {boolean} checked - The state of the checkbox for the centre.
   * @param {number} index - The index of the centre in the 'centres' form array.
   */
  public updateUserAttachedCentres(checked: boolean, index: number): void {
    const roleControl =
      this.userForm.controls.centres.controls[index].controls.role_id;
    const centreControleControl =
      this.controleurForm?.controls.centres_controle.controls[index];
    if (checked) {
      roleControl.enable();
      roleControl.dirty &&
        roleControl.setValue(
          this.userForm.getRawValue().is_controleur
            ? this.controleurRole?.id
            : null
        );
      centreControleControl?.enable();
    } else {
      roleControl.disable();
      roleControl.reset();
      this.updateRequiredStatus$.next();
      centreControleControl?.disable();
      centreControleControl?.setValue(false);
    }
  }

  /**
   * Returns an array of selected centre IDs and corresponding role IDs based on the state of the 'centres' form array.
   * @returns {{ id: number, role_id: number }[]} An array of objects containing selected centre IDs and corresponding role IDs.
   */
  private get userAttachedCentres(): { id: number; role_id: number }[] {
    return this.userForm.getRawValue().centres.reduce((acc, centre, index) => {
      if (!centre.id) return acc;
      return [
        ...acc,
        {
          id: this.centres[index].id,
          role_id: centre.role_id,
        },
      ];
    }, []);
  }

  /**
   * Returns an array of selected centre IDs based on the state of the 'centres_controle' form array.
   * @returns {number[]} An array of selected centre IDs.
   */
  private get controleurAttachedCentres(): number[] {
    return this.controleurForm
      .getRawValue()
      .centres_controle.reduce((acc, centreId, index) => {
        if (!centreId) return acc;
        return [...acc, this.centres[index].id];
      }, []);
  }

  /**
   * Opens a dialog to display the list of possible inactivity reasons and allows the user to select one.
   * If the popup is canceled, the selection of the controleur checkbox will be reset.
   * Marks fields as dirty to ensure that their values are sent in the payload of edit mode.
   * @param {number} index - The index of the inactivity reason to update.
   */
  private popUpInactivityReason(index?: number): void {
    this.dialog
      .open(InactivityReasonPopupComponent, {
        data: this.desactivationMotifs,
        width: window.innerWidth > 640 ? '50%' : '100%',
      })
      .afterClosed()
      .pipe(
        take(1),
        tap((motif: IDesactivationMotif) => {
          if (motif) {
            this.userForm.patchValue({
              desactivation_motif_id: motif.id,
              desactivation_motif_text: motif.libelle,
            });
            this.userForm.controls.desactivation_motif_id.markAsDirty();
            this.userForm.controls.desactivation_motif_text.markAsDirty();
          } else {
            // Manage the cancellation of the popup.
            if (index != null) {
              // When an index is provided, the action was triggered by the centres_controle checkbox.
              this.controleurForm?.controls.centres_controle.controls[
                index
              ].setValue(true);
            } else {
              // When no index is provided, the action was triggered by the active/inactive radio button.
              this.userForm.controls.actif.setValue(true);
              this.userForm.controls.centres.controls.forEach(
                ({ controls, value }, i) => {
                  controls.id.enable();
                  if (value.id) {
                    controls.role_id.enable();
                    this.controleurForm?.controls.centres_controle.controls[
                      i
                    ].enable();
                  }
                }
              );
            }
          }
        })
      )
      .subscribe();
  }

  /**
   * Resets the inactivity reason fields and marks them as dirty.
   * Marks fields as dirty to ensure that their values are sent in the payload of edit mode.
   */
  private resetInactivityReason(): void {
    this.userForm.patchValue({
      desactivation_motif_id: null,
      desactivation_motif_text: null,
    });
    this.userForm.controls.desactivation_motif_id.markAsDirty();
    this.userForm.controls.desactivation_motif_text.markAsDirty();
  }

  public get incativityReasonMessage(): string {
    const reasonId = this.userForm.value.desactivation_motif_id;
    if (!reasonId) return '';
    const value =
      reasonId === 5
        ? this.userForm.value.desactivation_motif_text
        : this.desactivationMotifs.find((motif) => motif.id === reasonId)
            .libelle;

    return this.translateService.instant('users.inactivityReasonMessage', {
      value,
    });
  }

  public addRole(): void {
    this.sharedService.redirectToNewTab(['/p/settings/roles/add']);
  }

  /**
   * Handles a change in the status of the user (active or inactive).
   * If the user becomes active, the inactivity reason is reset.
   * If the user becomes inactive, a dialog box is opened to allow the user to select an inactivity reason.
   *
   * @param {boolean} isActif - Indicates whether the user is now active (true) or inactive (false).
   */
  public onStatusChange(isActif: boolean): void {
    const isControleur = this.userForm.getRawValue().is_controleur;
    if (isActif) {
      this.userForm.controls.centres.controls.forEach(
        ({ controls, value }, i) => {
          controls.id.enable();
          if (value.id) {
            controls.role_id.enable();
            this.controleurForm?.controls.centres_controle.controls[i].enable();
          }
        }
      );
      if (
        !isControleur ||
        !this.userForm.getRawValue().desactivation_motif_id ||
        !this.controleurAttachedCentres.length
      )
        return;
      this.resetInactivityReason();
    } else {
      this.userForm.controls.centres.disable();
      this.controleurForm?.controls.centres_controle.disable();
      if (!isControleur) return;
      this.popUpInactivityReason();
    }
  }

  ngOnDestroy(): void {
    this.usersStore.initUser();
    this.subscriptions?.unsubscribe();
  }
}
