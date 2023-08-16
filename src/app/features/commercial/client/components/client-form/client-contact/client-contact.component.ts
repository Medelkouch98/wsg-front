import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClientStore } from '../../../client.store';
import {
  IClientProContact,
  IContactFormGroup,
  IContactRowForm,
} from '../../../models';
import { ICivilite } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/store/app.state';
import { Observable, Subject, Subscription } from 'rxjs';
import { CiviliteByTypeAndStateSelector } from '../../../../../../core/store/resources/resources.selector';
import { MOBILE_PATTERN, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmationPopupComponent } from '@app/components';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { GlobalHelper } from '@app/helpers';
import { ClientsValidators } from '../../../validators/clients.validators';
import { CivilitePipe, FormControlErrorPipe } from '@app/pipes';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MarkRequiredFormControlAsDirtyDirective } from '@app/directives';

@Component({
  selector: 'app-client-contact',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    ConfirmationPopupComponent,
    CivilitePipe,
    FormControlErrorPipe,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './client-contact.component.html',
})
export class ClientContactComponent implements OnInit, OnDestroy {
  @Input() addMode: boolean;
  @Input() isReadOnly$: Observable<boolean>;
  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }
  @ViewChild(MatSort) sort: MatSort;
  civilites$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector(1, true))
  );

  public columns: string[] = [
    'civilite',
    'nom',
    'prenom',
    'fonction',
    'fixe',
    'mobile',
    'email',
    'recoit_facture',
    'recoit_commercial',
    'recoit_relance',
    'recoit_bl',
    'actions',
  ];
  public dataSource = new MatTableDataSource<FormGroup<IContactRowForm>>();
  public contacts: IClientProContact[] = [];
  // Pour stocker le contact à modifier si jamais on veut annuler les changements
  public contactToEdit: IClientProContact;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public contactForm: FormGroup<IContactFormGroup>;
  public isNewRow = false;
  public subscription: Subscription = new Subscription();
  public updateRequiredStatus$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private clientsValidators: ClientsValidators,
    private clientStore: ClientStore,
    private store: Store<AppState>,
    private matDialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.createContactForm();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.clientStore.contacts$
        .pipe(withLatestFrom(this.isReadOnly$))
        .subscribe(([contacts, isReadOnly]: [IClientProContact[], boolean]) => {
          this.dataSource = new MatTableDataSource();
          this.contactToEdit = null;
          this.isNewRow = false;
          this.contacts = contacts;
          if (contacts?.length > 0) {
            contacts.forEach((contact: IClientProContact) =>
              this.fillContactForm(contact)
            );
            this.updateRequiredStatus$.next();
          }
          if (isReadOnly) {
            this.contactForm.disable();
            this.columns.pop();
          } else {
            this.contactForm.enable();
            if (!this.columns.includes('actions')) {
              this.columns.push('actions');
            }
          }
          this.dataSource.sortingDataAccessor = (
            data: AbstractControl,
            sortHeaderId: string
          ) => {
            const value: any = data.value[sortHeaderId];
            return typeof value === 'string' ? value.toLowerCase() : value;
          };
          this.dataSource.sort = this.sort;
        })
    );
  }

  /**
   * Créer le formulaire de contact
   */
  createContactForm() {
    this.contactForm = this.fb.group({
      contactRowsForm: this.fb.array([] as FormGroup<IContactRowForm>[]),
    });
  }

  /**
   * Remplire la liste des contacts
   * @param data IClientContact
   */
  fillContactForm(data: IClientProContact) {
    const formGroup: FormGroup<IContactRowForm> = this.fb.group(
      {
        id: [data.id],
        civilite_id: [data.civilite_id],
        nom: [data.nom, Validators.required],
        prenom: [data.prenom, Validators.required],
        fonction: [data.fonction],
        fixe: [data.fixe, [Validators.pattern(MOBILE_PATTERN)]],
        mobile: [data.mobile, [Validators.pattern(MOBILE_PATTERN)]],
        email: [data.email],
        recoit_bl: [data.recoit_bl],
        recoit_commercial: [data.recoit_commercial],
        recoit_facture: [data.recoit_facture],
        recoit_relance: [data.recoit_relance],
        client_pro_id: [data.client_pro_id],
        isEditable: [!data.nom && !data.prenom],
      },
      {
        validators: [this.clientsValidators.emailRequiredToReceiptInvoice()],
      }
    );
    this.dataSource.data.push(formGroup);
    this.contactRowsForm().push(formGroup);
  }

  /**
   * get contact Rows form
   * @return FormArray
   */
  contactRowsForm(): FormArray<FormGroup<IContactRowForm>> {
    return this.contactForm.controls.contactRowsForm;
  }

  /**
   * ajouter une nouvelle ligne dans le tableau
   */
  addNewRow(): void {
    this.clientStore.addNewContact();
    this.isNewRow = true;
  }

  /**
   * permet d'activer le champ de sélection pour l'édition
   * @param element FormGroup
   * @param index number
   */
  editRow(element: FormGroup<IContactRowForm>, index: number): void {
    // stocker la ligne à éditer
    this.contactToEdit = element.getRawValue();
    element.controls.isEditable.patchValue(true);
  }

  /**
   * Ajouter ou modifier contact
   * @param element FormGroup
   * @param index number
   */
  saveRow(element: FormGroup<IContactRowForm>, index: number): void {
    const { id, ...contact } = element.getRawValue();
    if (!this.addMode) {
      delete contact.isEditable;
      // si la ligne existe déja, appeler update effect
      const selectedContact = this.contacts?.find(
        (row: IClientProContact) => row.id === id
      );
      if (selectedContact) {
        // call update
        const updatedValues = {};
        GlobalHelper.getUpdatedControles(element, updatedValues);
        this.clientStore.updateContactExistingClient({
          contact: updatedValues,
          index,
          clientProContactId: id,
        });
      } else {
        // call add
        this.clientStore.addContactExistingClient({
          contact: contact,
          index,
        });
      }
    } else {
      element.controls.isEditable.patchValue(false);
      delete contact.isEditable;
      // dans l'ajout de client
      this.clientStore.addOrUpdateContact({ contact, index });
    }
  }

  /**
   * Supprimer contact
   * @param element FormGroup
   * @param index number
   */
  deleteRow(element: FormGroup<IContactRowForm>, index: number): void {
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
            if (!this.addMode) {
              this.clientStore.deleteContactExistingClient({
                index,
                clientProContactId: element.value.id,
              });
            } else {
              this.clientStore.removeContact(index);
            }
          })
        )
        .subscribe()
    );
  }

  /**
   * Annuler les changements
   * @param element FormGroup
   * @param index number
   */
  cancelChanges(element: FormGroup<IContactRowForm>, index: number): void {
    // récupérer la ligne avant edition
    if (this.contactToEdit) {
      // remplacer la ligne par les données avant edition
      element.patchValue(this.contactToEdit);
      this.contactToEdit = null;
    } else {
      this.clientStore.removeContact(index);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
