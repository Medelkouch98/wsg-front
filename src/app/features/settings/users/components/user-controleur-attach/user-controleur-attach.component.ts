import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ICentre, IControleur, IUser, User } from '@app/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import {
  Observable,
  tap,
  BehaviorSubject,
  take,
  Subscription,
  filter,
  Subject,
} from 'rxjs';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserControleurAttachStore } from './user-controleur-attach.store';
import { EMAIL_PATTERN } from '@app/config';
import { UniqueValidator } from 'app/core/validators';
import { UsersStore } from '../../users.store';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatOptionSelectionChange } from '@angular/material/core';
import {
  IUserControleurAttachFormGroup,
  IUserControleurAttachRowForm,
} from '../../models';
import { select, Store } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { UserCurrentCentreSelector } from 'app/core/store/auth/auth.selectors';

const DEFAULT_ROLE_ID = 2;

@Component({
  selector: 'app-user-controleur-attach',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AsyncPipe,
    FieldControlLabelDirective,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    TranslateModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MarkRequiredFormControlAsDirtyDirective,
    FormControlErrorDirective,
  ],
  providers: [UserControleurAttachStore, UniqueValidator, UsersStore],
  templateUrl: './user-controleur-attach.component.html',
})
export class UserControleurAttachComponent implements OnInit, OnDestroy {
  @ViewChildren('autoCompleteInput') autoCompleteInputs: QueryList<ElementRef>;
  @ViewChildren(MatAutocompleteTrigger, { emitDistinctChangesOnly: true })
  matAutocompleteTriggers: QueryList<MatAutocompleteTrigger>;

  public columns = ['nom', 'prenom', 'agrement', 'user', 'login', 'email'];
  public attachForm: FormGroup<IUserControleurAttachFormGroup>;
  public updateRequiredStatus$ = new Subject<void>();
  private unattachedUsersControllers$: Observable<IControleur[]> =
    this.userControleurAttachStore.unattachedControllers$.pipe(
      filter((controleurs) => !!controleurs?.length),
      tap((controleurs) => this.initAttachForm(controleurs))
    );
  private unattachedUsers$: Observable<IUser[]> =
    this.userControleurAttachStore.filteredUsers$.pipe(
      tap((users) => {
        this.searchUsers = users;
        this.filteredUsers$.next(users);
      })
    );

  private currentCentre$: Observable<ICentre> = this.store
    .pipe(select(UserCurrentCentreSelector))
    .pipe(
      take(1),
      tap(
        (centre) =>
          (this.newUser.centres = [{ id: centre.id, role_id: DEFAULT_ROLE_ID }])
      )
    );
  public filteredUsers$: BehaviorSubject<IUser[]> = new BehaviorSubject([]);
  public showCancelButton$: Observable<boolean> =
    this.userControleurAttachStore.showCancelButton$;
  public newUser: IUser = new User();
  public dataSource = new MatTableDataSource<
    FormGroup<IUserControleurAttachRowForm>
  >();
  public searchUsers: IUser[];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private userControleurAttachStore: UserControleurAttachStore,
    private uniqueValidator: UniqueValidator,
    private translateService: TranslateService,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: { controleurs: IControleur[] }
  ) {
    this.userControleurAttachStore.setUnattachedControllers(data.controleurs);
    this.userControleurAttachStore.getUnattachedUsers();
    this.attachForm = this.fb.group({
      attachRowsForm: this.fb.array(
        [] as FormGroup<IUserControleurAttachRowForm>[]
      ),
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(this.unattachedUsers$.subscribe());
    this.subscriptions.add(this.unattachedUsersControllers$.subscribe());
    this.currentCentre$.subscribe();
  }

  /**
   * Init form for the given array of controllers, and adds it to attachRowsForm.
   * @param {IControleur[]} controleurs - The array of controllers to attach users to.
   */
  public initAttachForm(controleurs: IControleur[]): void {
    this.attachRowsForm.clear();
    controleurs.forEach((controleur) =>
      this.attachRowsForm.push(
        this.fb.group({
          controleur: new FormControl<IControleur>(controleur),
          user: new FormControl<IUser>(null, Validators.required),
          login: new FormControl<string>(
            { value: null, disabled: true },
            {
              validators: [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(40),
                this.uniqueValidator.uniqueLoginInForm(),
              ],
              asyncValidators: this.uniqueValidator.uniqueLogin(),
              updateOn: 'blur',
            }
          ),
          email: new FormControl<string>({ value: null, disabled: true }, [
            Validators.required,
            Validators.pattern(EMAIL_PATTERN),
          ]),
        })
      )
    );
    this.dataSource = new MatTableDataSource(this.attachRowsForm.controls);
    this.updateRequiredStatus$.next();
  }

  /**
   * Returns the attachRowsForm property of the attachForm control as a FormArray.
   * @returns {FormArray<FormGroup<IUserControleurAttachRowForm>>} - The attachRowsForm property of the attachForm control as a FormArray.
   */
  public get attachRowsForm(): FormArray<
    FormGroup<IUserControleurAttachRowForm>
  > {
    return this.attachForm.controls.attachRowsForm;
  }

  /**
   * Returns a string representation of the given IUser object for display purposes.
   * @param {IUser} [user] - The user object to display.
   * @returns {string | null} - A string representing the user object for display, or null if the user object is undefined or null.
   */
  public displayFn = (user?: IUser): string | null => {
    if (!user) return null;
    return user.id
      ? `${user.nom} ${user.prenom}`
      : this.translateService.instant('users.newUser');
  };

  /**
   * Filters the searchUsers array by the given index and updates the filteredUsers$ BehaviorSubject.
   * @param {number} index - The index of the autocomplete input to filter by.
   */
  public searchUsersList(index: number): void {
    const filteredValue = this.autoCompleteInputs
      .get(index)
      .nativeElement.value.toLowerCase();
    const filtered = this.searchUsers.filter((user) =>
      `${user.nom} ${user.prenom}`.toLowerCase().includes(filteredValue)
    );
    this.filteredUsers$.next(filtered);
  }

  /**
   * Sets up the closing actions for the autocomplete panel, and updates the user values in the form when a user is selected.
   * @param {number} index - The index of the autocomplete input to set up the closing actions for.
   */
  public onOpenAutoComplete(index: number): void {
    const trigger = this.matAutocompleteTriggers.get(index);
    trigger.panelClosingActions
      .pipe(
        take(1),
        tap((e: MatOptionSelectionChange<IUser>) => {
          const user: IUser = e?.source?.value;
          if (!user) {
            this.attachRowsForm.controls[index].patchValue({
              user: null,
              login: null,
              email: null,
            });
          } else {
            this.setRowFormValues(user, index);
          }
          this.userControleurAttachStore.setFilteredUsers(this.selectedUserIds);
          trigger.closePanel();
        })
      )
      .subscribe();
  }

  /**
   * Sets the form values for a given row based on the selected user.
   * If the user has an id, the login and email fields are disabled and filled with the user's information.
   * If the user does not have an id, the login and email fields are enabled and filled with the corresponding
   * values from the controleur object associated with the row.
   * @param user - The selected user.
   * @param rowIndex - The index of the row in the form array.
   */
  public setRowFormValues(user: IUser, rowIndex: number): void {
    const rowForm = this.attachRowsForm.at(rowIndex);
    const loginControl = rowForm.controls.login;
    const emailControl = rowForm.controls.email;
    if (user.id) {
      loginControl.disable();
      emailControl.disable();
    } else {
      loginControl.pristine && loginControl.markAsDirty();
      loginControl.enable();
      emailControl.enable();
      user = {
        ...user,
        nom: rowForm.value.controleur.nom,
        prenom: rowForm.value.controleur.prenom,
        login: rowForm.value.controleur.agrement_vl,
        email: rowForm.value.controleur.email,
        is_controleur: false,
      };
    }
    rowForm.patchValue({
      user,
      login: user.login,
      email: user.email,
    });
  }

  /**
   * Returns an array of selected user ids from the attachRowsForm.
   * @returns {number[]} An array of selected user ids.
   */
  private get selectedUserIds(): number[] {
    return this.attachRowsForm.value
      .filter((row) => !!row.user)
      .map((row) => row.user.id);
  }

  /**
   * Submits attached users.
   */
  public submitUsers(): void {
    this.userControleurAttachStore.attachUsers(
      this.attachRowsForm.getRawValue()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
