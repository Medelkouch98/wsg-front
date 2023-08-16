import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { MaterialStore } from '../../material.store';
import {
  IMaterialFormGroup,
  IMaterialMarque,
  IMaterialModele,
  IMaterialMaintenanceCompany,
  IMaterialSubType,
  IMaterial,
  IMaterialFormGroupValue,
  IMaterialEvent,
  SubTypesByType,
  CONNECTED_MATERIAL_CATEGORY_ID,
  MaterialMaintenanceCompany,
} from '../../models';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { GlobalHelper } from '@app/helpers';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ConfirmationPopupComponent } from '@app/components';
import { MaterialMaintenanceCompanyFormComponent } from './material-maintenance-company-form/material-maintenance-company-form.component';
import { MaterialCharacteristicsFormComponent } from './material-characteristics-form/material-characteristics-form.component';
import { MaterialEventsTableComponent } from './material-events-table/material-events-table.component';
import { MaterialEventsFormComponent } from './material-events-form/material-events-form.component';
import { MatRadioModule } from '@angular/material/radio';

/**
 * Component for displaying and managing the material form.
 */
@Component({
  selector: 'app-material-form',
  templateUrl: './material-form.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    MatDialogModule,
    MatAutocompleteModule,
    MaterialEventsTableComponent,
    MaterialCharacteristicsFormComponent,
    MaterialEventsFormComponent,
    MaterialMaintenanceCompanyFormComponent,
    MarkRequiredFormControlAsDirtyDirective,
    FieldControlLabelDirective,
    FormControlErrorDirective,
  ],
})
export class MaterialFormComponent implements OnInit, OnDestroy {
  private materialStore = inject(MaterialStore);
  private fb = inject(FormBuilder);
  public store = inject(Store<AppState>);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);

  @Input() addMode: boolean;
  @Input() isReadOnly: boolean;
  @Output() popUpEventForm = new EventEmitter<IMaterialEvent>();

  public material$: Observable<IMaterial> = this.materialStore.material$;
  private subTypes$: Observable<IMaterialSubType[]> =
    this.materialStore.subTypes$;

  /**
   * Observable for retrieving the sub-types options.
   */
  public subTypesOptions$: Observable<SubTypesByType[]> =
    this.materialStore.subTypesByType$.pipe(
      map((types) => {
        return this.addMode
          ? types
              .map((type) => ({
                ...type,
                subTypes: type.subTypes.filter(
                  ({ materiel_categorie_id }) =>
                    materiel_categorie_id != CONNECTED_MATERIAL_CATEGORY_ID
                ),
              }))
              .filter(({ subTypes }) => subTypes.length)
          : types;
      })
    );
  public marques$: Observable<IMaterialMarque[]> = this.materialStore.marques$;
  public filteredMarques$: Observable<IMaterialMarque[]>;
  public modeles$: Observable<IMaterialModele[]> = this.materialStore.modeles$;
  public filteredModeles$: Observable<IMaterialModele[]>;
  public maintenanceCompanies$: Observable<IMaterialMaintenanceCompany[]> =
    this.materialStore.maintenanceCompanies$;
  public materialEvents$: Observable<IMaterialEvent[]> =
    this.materialStore.materialEvents$;
  public materialForm: FormGroup<IMaterialFormGroup>;
  public updateRequiredStatus$ = new Subject<void>();
  public subType: IMaterialSubType;
  public subscriptions = new Subscription();

  ngOnInit(): void {
    const materialSub = this.material$
      .pipe(
        withLatestFrom(this.subTypes$, this.maintenanceCompanies$),
        filter(
          ([material]: [
            IMaterial,
            IMaterialSubType[],
            IMaterialMaintenanceCompany[]
          ]) => this.addMode || !!material?.id
        ),
        tap(
          ([material, subTypes, maintenanceCompanies]: [
            IMaterial,
            IMaterialSubType[],
            IMaterialMaintenanceCompany[]
          ]) => {
            this.initForm(material, subTypes, maintenanceCompanies);
            (this.isReadOnly ||
              material?.materiel_categorie_id ===
                CONNECTED_MATERIAL_CATEGORY_ID) &&
              this.materialForm.disable();
            this.filteredMarques$ = this.filterMarques();
            this.filteredModeles$ = this.filterModeles();
          }
        )
      )
      .subscribe();

    this.subscriptions.add(materialSub);
  }

  /**
   * Initializes the material form.
   * @param material - The material object.
   * @param subTypes - The list of material sub-types.
   * @param maintenanceCompanies - The list of material maintenance companies.
   */
  private initForm(
    material: IMaterial,
    subTypes: IMaterialSubType[],
    maintenanceCompanies: IMaterialMaintenanceCompany[]
  ): void {
    const materialForm: IMaterialFormGroup = {
      materiel_categorie_id: new FormControl(null, Validators.required),
      materiel_type_id: new FormControl(null, Validators.required),
      materiel_sous_type_id: new FormControl(
        {
          value: null,
          disabled: !this.addMode,
        },
        Validators.required
      ),
      marque: new FormControl(null, Validators.required),
      modele: new FormControl(null, Validators.required),
      numero_serie: new FormControl(null),
      materiel_societe_maintenance_id: new FormControl(null),
      materiel_caracteristiques: new FormControl([]),
      materiel_evenements: new FormControl([]),
      societe_maintenance: new FormControl(null),
    };

    this.materialForm = this.fb.group(materialForm);
    this.materialForm.patchValue(material);
    if (!this.addMode) {
      this.subType = subTypes.find(
        ({ id }) => id === material.materiel_sous_type_id
      );
      this.setMaintenanceCompanyForm(
        material.materiel_societe_maintenance_id,
        maintenanceCompanies
      );
    }
  }

  /**
   * Handles the change event of the sub-type selection.
   * @param subType - The selected sub-type.
   */
  public onSubTypeChange(subType: IMaterialSubType): void {
    this.materialForm.patchValue({
      materiel_categorie_id: subType.materiel_categorie_id,
      materiel_type_id: subType.materiel_type_id,
    });
    this.subType = subType;
  }

  /**
   * Determines whether to show the event form.
   * @returns True if the event form should be shown, false otherwise.
   */
  public get showEventForm(): boolean {
    return this.subType.materiel_evenement_types.some(
      ({ is_required }) => is_required
    );
  }

  /**
   * Filters the marques based on user input.
   * @returns The filtered marques.
   */
  private filterMarques(): Observable<IMaterialMarque[]> {
    return this.materialForm.controls.marque.valueChanges.pipe(
      // delay emits
      debounceTime(300),
      switchMap((value: string) =>
        this.marques$.pipe(
          map((marques: IMaterialMarque[]) =>
            marques.filter((row: IMaterialMarque) =>
              row.libelle.toLowerCase().includes(value?.toLowerCase())
            )
          )
        )
      )
    );
  }

  /**
   * Filters the modeles based on user input.
   * @returns The filtered modeles.
   */
  private filterModeles(): Observable<IMaterialModele[]> {
    return this.materialForm.controls.modele.valueChanges.pipe(
      // delay emits
      debounceTime(300),
      switchMap((value: string) =>
        this.modeles$.pipe(
          map((modeles: IMaterialModele[]) =>
            modeles.filter((row: IMaterialModele) =>
              row.libelle.toLowerCase().includes(value?.toLowerCase())
            )
          )!
        )
      )
    );
  }

  /**
   * Sets the maintenance company form value.
   * @param companyId - The ID of the selected maintenance company.
   * @param maintenanceCompanies - The list of maintenance companies.
   */
  public setMaintenanceCompanyForm(
    companyId: number,
    maintenanceCompanies: IMaterialMaintenanceCompany[]
  ): void {
    const company = maintenanceCompanies.find(({ id }) => id === companyId);
    const maintenanceCompanyForm: FormControl<IMaterialMaintenanceCompany> =
      this.materialForm.controls.societe_maintenance;
    maintenanceCompanyForm.patchValue(
      company ?? new MaterialMaintenanceCompany()
    );
    maintenanceCompanyForm.markAsPristine();
  }

  /**
   * Saves the material form.
   */
  public saveMaterial(): void {
    if (this.addMode) {
      const maintenanceCompanyForm: FormControl<IMaterialMaintenanceCompany> =
        this.materialForm.controls.societe_maintenance;
      const formValue: IMaterialFormGroupValue =
        this.materialForm.getRawValue();
      maintenanceCompanyForm?.pristine && delete formValue.societe_maintenance;
      this.materialStore.addMaterial(formValue);
    } else {
      const materialFormValue: Partial<IMaterialFormGroupValue> =
        GlobalHelper.getDirtyValues(this.materialForm);
      this.materialStore.updateMaterial(materialFormValue);
    }
  }

  public deleteEvent(idEvent: number): void {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('commun.deleteConfirmation'),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((res: boolean) => !!res),
        tap(() => this.materialStore.deleteEvent(idEvent))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
