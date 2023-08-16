import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApporteurAffaireStore } from '../../../apporteur-affaire.store';
import { MatDialog } from '@angular/material/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ICivilite } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/store/app.state';

import { CiviliteByTypeAndStateSelector } from '../../../../../../core/store/resources/resources.selector';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import {
  EMAIL_PATTERN,
  MOBILE_PATTERN,
  MIN_PAGE_SIZE_OPTIONS,
} from '@app/config';
import { ConfirmationPopupComponent } from '@app/components';
import { GlobalHelper } from '@app/helpers';
import { IApporteurAffaireContact } from '../../../models';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CivilitePipe, FormControlErrorPipe } from '@app/pipes';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  IApporteurAffaireLocalContactRowForm,
  IApporteurAffaireLocalFormGroup,
} from './models/apporteur-affaire-local-contact-group.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkRequiredFormControlAsDirtyDirective } from '@app/directives';

@Component({
  selector: 'app-apporteur-affaire-contact',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ConfirmationPopupComponent,
    CivilitePipe,
    FormControlErrorPipe,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './apporteur-affaire-contact.component.html',
})
export class ApporteurAffaireContactComponent implements OnInit {
  @Input() addMode: boolean;
  @Input() isReadOnly$: Observable<boolean>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  civilite$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector(1))
  );
  public columns = [
    'civilite',
    'nom',
    'prenom',
    'fonction',
    'telephonefixe',
    'mobile',
    'email',
    'actions',
  ];
  contactForm: FormGroup<IApporteurAffaireLocalFormGroup>;
  dataSource = new MatTableDataSource<
    FormGroup<IApporteurAffaireLocalContactRowForm>
  >();
  // Pour stocker le contact à modifier si jamais on veut annuler les changements
  contactToEdit: IApporteurAffaireContact;
  isNewRow = false;
  MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  subscription = new Subscription();
  public updateRequiredStatus$ = new Subject<void>();

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private apporteurAffaireStore: ApporteurAffaireStore,
    private store: Store<AppState>
  ) {
    this.createContactForm();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.apporteurAffaireStore.ApporteurAffaireLocalContactSelector$.pipe(
        withLatestFrom(this.isReadOnly$)
      ).subscribe(
        ([contacts, isReadOnly]: [IApporteurAffaireContact[], boolean]) => {
          this.dataSource = new MatTableDataSource();
          this.contactToEdit = null;
          this.isNewRow = false;
          for (let contact of contacts) {
            this.fillContactForm(contact);
          }
          this.updateRequiredStatus$.next();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sortingDataAccessor = (
            data: AbstractControl,
            sortHeaderId: string
          ) => {
            const value: any = data.value[sortHeaderId];
            return typeof value === 'string' ? value.toLowerCase() : value;
          };
          this.dataSource.sort = this.sort;

          if (isReadOnly) {
            this.contactForm.disable();
            this.columns.pop();
          } else {
            this.contactForm.enable();
            if (!this.columns.includes('actions')) {
              this.columns.push('actions');
            }
          }
        }
      )
    );
  }

  /**
   * Créer le formulaire de contact
   */
  createContactForm() {
    this.contactForm = this.fb.group({
      contacts: this.fb.array(
        [] as FormGroup<IApporteurAffaireLocalContactRowForm>[]
      ),
    });
  }

  /**
   * get contact Rows form
   * @return FormArray
   */
  contactRowsForm(): FormArray<
    FormGroup<IApporteurAffaireLocalContactRowForm>
  > {
    return this.contactForm.controls.contacts;
  }

  /**
   * Remplire la liste des contacts
   * @param data IApporteurAffaireContact
   */
  fillContactForm(data: IApporteurAffaireContact): void {
    const formGroup: FormGroup<IApporteurAffaireLocalContactRowForm> =
      this.fb.group({
        id: [data.id],
        civilite_id: [data.civilite_id],
        nom: [data.nom, Validators.required],
        prenom: [data.prenom, Validators.required],
        fixe: [data.fixe, [Validators.pattern(MOBILE_PATTERN)]],
        mobile: [data.mobile, [Validators.pattern(MOBILE_PATTERN)]],
        email: [data.email, Validators.pattern(EMAIL_PATTERN)],
        fonction: [data.fonction],
        isEditable: [!data.nom],
      });
    this.dataSource.data.push(formGroup);
    this.contactRowsForm().push(formGroup);
  }

  /**
   * gestion d'enregistrement de ligne
   * @param form : IApporteurAffaireContact
   * @param index : number
   */
  saveRow(form: FormGroup, index: number) {
    const { id, isEditable, ...contact } = form.getRawValue();
    if (id) {
      // modifier le contact
      let updatedValues = {};
      GlobalHelper.getUpdatedControles(form, updatedValues);
      //le contact existe dans la BD, on l'ajoute directement
      this.apporteurAffaireStore.UpdateContactExistingApporteur({
        contact: updatedValues,
        index,
        contactId: id,
      });
    } else {
      //le contact n'existe pas encore dans la BD
      if (!this.addMode) {
        //l'apporteur existe, on peut enregistrer le contact directement
        this.apporteurAffaireStore.AddContactEffect({
          contact,
          index,
        });
      } else {
        //l'apporteur n'existe pas, on l'ajoute dans le store
        this.apporteurAffaireStore.AddOrUpdateContact({
          contact,
          index,
        });
      }
    }
  }

  /**
   * dialog suppression de contact
   * @param contactForm: FormGroup
   * @param index: number
   */
  openDeleteConfirmationDialog(contactForm: FormGroup, index: number) {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
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
            if (!contactForm.value.id) {
              this.apporteurAffaireStore.RemoveContact(index);
            } else {
              this.apporteurAffaireStore.DeleteContactEffect({
                contactId: contactForm.value.id,
                index,
              });
            }
          })
        )
        .subscribe()
    );
  }

  /**
   * ajout d'une nouvelle ligne dans le form array
   */
  addNewRow() {
    this.apporteurAffaireStore.AddNewContact();
    this.isNewRow = true;
  }

  /**
   * ouverture de la ligne en mode modification
   * @param element:FormGroup
   * @param index:number
   */
  editRow(element: FormGroup, index: number) {
    // stocker la ligne à éditer
    this.contactToEdit = element.getRawValue();
    element.controls.isEditable.patchValue(true);
  }

  /**
   * annuler les modifications de la ligne
   * @param element:FormGroup
   * @param index:number
   */
  cancelChanges(element: FormGroup, index: number) {
    if (this.contactToEdit) {
      // remplacer la ligne par les données avant edition
      element.patchValue(this.contactToEdit);
      this.contactToEdit = null;
      this.isNewRow = false;
    } else {
      this.apporteurAffaireStore.RemoveContact(index);
    }
  }
}
