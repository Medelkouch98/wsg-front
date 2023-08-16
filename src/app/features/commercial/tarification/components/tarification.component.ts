import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.state';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IPrestation, ITva } from '@app/models';
import { combineLatest, Observable, Subscription } from 'rxjs';
import * as resourcesSelector from '../../../../core/store/resources/resources.selector';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  ITarification,
  ITarificationFormGroup,
  ITarificationRowForm,
  ITarificationRowTable,
  Tarification,
  TarificationRowTable,
} from '../models';
import { TarificationHelper } from '@app/helpers';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationPopupComponent } from '@app/components';
import { filter, tap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TarificationValidators } from '../validators/tarification.validators';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormControlErrorPipe } from '@app/pipes';
import { FieldControlLabelDirective } from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DecimalNumberDirective } from '../../../../shared/directives/decimal-number.directive';

@Component({
  selector: 'app-tarification',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    ConfirmationPopupComponent,
    FieldControlLabelDirective,
    FormControlErrorPipe,
    DecimalNumberDirective,
  ],
  templateUrl: './tarification.component.html',
})
export class TarificationComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isReadOnly$: Observable<boolean>;
  @Input() remisePourcentage: number;
  @Input() tarificationsList$: Observable<ITarification[]>;
  @Output() addUpdate: EventEmitter<ITarification> =
    new EventEmitter<ITarification>();
  @Output() delete: EventEmitter<ITarification> =
    new EventEmitter<ITarification>();
  @Output() remiseGlobal: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) sort: MatSort;

  public tarificationForm: FormGroup<ITarificationFormGroup>;
  public displayedColumns: string[] = [
    'codeprestation',
    'libelleprestation',
    'prix_ht',
    'prix_ttc',
    'remise_euro',
    'remise_pourcentage',
    'prixttcremise',
    'actions',
  ];
  public dataSource = new MatTableDataSource<FormGroup<ITarificationRowForm>>();
  public pourcentremise: FormControl<number> = new FormControl(null, [
    Validators.min(0),
    Validators.max(100),
  ]);
  public tarifications: ITarification[] = [];
  public prestations: IPrestation[] = [];
  public tvas: ITva[] = [];
  public isNewRow = false;
  // stocker la ligne à modifier si jamais on veut annuler les changements
  public tarificationToEdit: ITarification;
  public allowedPrestations: IPrestation[] = [];
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private tarificationValidator: TarificationValidators,
    private toasterService: ToastrService,
    private translateService: TranslateService
  ) {
    this.createTarificationForm();
  }

  ngOnChanges() {
    this.pourcentremise.setValue(this.remisePourcentage);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.isReadOnly$.subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.tarificationForm.disable();
          this.pourcentremise.disable();
          this.displayedColumns.pop();
        } else {
          this.tarificationForm.enable();
          this.pourcentremise.enable();
          if (!this.displayedColumns.includes('actions')) {
            this.displayedColumns.push('actions');
          }
        }
      })
    );

    this.subscription.add(
      combineLatest([
        this.store.pipe(select(resourcesSelector.PrestationsSelector)),
        this.tarificationsList$,
        this.store.pipe(select(resourcesSelector.TVAsSelector)),
      ]).subscribe(
        ([prestations, tarifications, tvas]: [
          IPrestation[],
          ITarification[],
          ITva[]
        ]) => {
          this.prestations = prestations;
          this.tvas = tvas;
          this.tarifications = tarifications;
          this.allowedPrestation();
          this.createTarificationForm();
          this.tarificationToEdit = null;
          this.isNewRow = false;
          if (prestations?.length > 0) {
            this.tarifications?.forEach((tarification: ITarification) => {
              const prestation = prestations?.find(
                (presta: IPrestation) =>
                  presta.id === tarification.prestation_id
              );
              const tva = this.tvas?.find(
                (tva_: ITva) => tva_.id === prestation?.tva_id
              );
              this.tarificationRowsForm().push(
                this.initiateTarificationArrayForm(
                  new TarificationRowTable(prestation, tva, tarification),
                  false
                )
              );
            });
            this.dataSource = new MatTableDataSource(
              this.tarificationRowsForm().controls
            );
            this.dataSource.sortingDataAccessor = (
              data: AbstractControl,
              sortHeaderId: string
            ) => {
              const value: any = data.value[sortHeaderId];
              return typeof value === 'string' ? value.toLowerCase() : value;
            };
            this.dataSource.sort = this.sort;
          }
        }
      )
    );
  }

  /**
   * creer le formulaire de tarification
   */
  private createTarificationForm(): void {
    this.tarificationForm = this.fb.group({
      tarificationRowsForm: this.fb.array(
        [] as FormGroup<ITarificationRowForm>[]
      ),
    });
  }

  /**
   * get tarification Rows form
   * @return FormArray
   */
  public tarificationRowsForm(): FormArray<FormGroup<ITarificationRowForm>> {
    return this.tarificationForm.controls.tarificationRowsForm;
  }

  /**
   * @return FormGroup
   */
  private initiateTarificationArrayForm(
    tarification?: ITarificationRowTable,
    isEditable?: boolean
  ): FormGroup<ITarificationRowForm> {
    return this.fb.group(
      {
        id: [tarification?.id ?? null],
        prestation_id: [
          tarification?.prestation_id ?? null,
          Validators.required,
        ],
        codeprestation: [tarification?.codeprestation ?? null],
        libelleprestation: [tarification?.libelleprestation ?? null],
        prix_ht: [tarification?.prix_ht ?? null],
        prix_ttc: [tarification?.prix_ttc ?? null],
        remise_euro: [tarification?.remise_euro ?? 0, Validators.min(1)],
        remise_pourcentage: [
          tarification?.remise_pourcentage ?? 0,
          [Validators.min(1), Validators.max(100)],
        ],
        prixttcremise: [tarification?.prixttcremise ?? null],
        isEditable: [isEditable ?? true],
      },
      {
        validators: this.tarificationValidator.remiseRequiredValidator(),
      }
    );
  }

  /**
   * emitter la valeur de remise globale
   */
  setRemisePourcent() {
    this.remiseGlobal.emit(this.pourcentremise.value);
  }

  /**
   * charger les infos de tarification aprés changement prestation
   * @param prestation MatSelectChange
   * @param element FormGroup
   */
  selectPrestation(
    prestation: MatSelectChange,
    element: FormGroup<ITarificationRowForm>
  ) {
    const selectedPrestation = this.allowedPrestations?.find(
      (presta: IPrestation) => presta.code === prestation.value
    );

    const selectedTva = this.tvas?.find(
      (tva: ITva) => tva.id === selectedPrestation?.tva_id
    );
    element.patchValue(
      new TarificationRowTable(selectedPrestation, selectedTva)
    );
  }

  /**
   * garder que les prestations qui n'ont pas encore été utilisés
   */
  allowedPrestation() {
    const taken_presta = this.tarifications?.map(
      (tarif: ITarification) => tarif.prestation_id
    );
    this.allowedPrestations = this.prestations.filter(
      (presta: IPrestation) =>
        !taken_presta?.includes(presta.id) && presta.actif
    );
  }

  /**
   * ajouter une nouvelle ligne dans le tableau
   */
  addNewRow() {
    this.tarificationRowsForm().insert(0, this.initiateTarificationArrayForm());
    this.dataSource = new MatTableDataSource(
      this.tarificationRowsForm().controls
    );
    this.isNewRow = true;
  }

  /**
   * emitter l'ajout ou la modif de tarification
   * @param element FormGroup
   */
  saveRow(element: FormGroup<ITarificationRowForm>) {
    element.controls.isEditable.patchValue(false);
    this.addUpdate.emit(new Tarification(element.getRawValue()));
  }

  /**
   * permet d'activer le champ de sélection pour l'édition
   * @param element FormGroup
   */
  editRow(element: FormGroup<ITarificationRowForm>) {
    // stocker la ligne à éditer
    this.tarificationToEdit = element.getRawValue();
    element.controls.isEditable.patchValue(true);
  }

  /**
   * emitter la suppression
   * @param element FormGroup
   */
  deleteRow(element: FormGroup<ITarificationRowForm>) {
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
            this.delete.emit(element.getRawValue());
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
  public cancelChanges(
    element: FormGroup<ITarificationRowForm>,
    index: number
  ): void {
    if (this.tarificationToEdit) {
      // remplacer la ligne par les données avant edition
      element.patchValue(this.tarificationToEdit);
      this.tarificationToEdit = null;
    } else {
      this.tarificationRowsForm().removeAt(index);
      this.dataSource = new MatTableDataSource(
        this.tarificationRowsForm().controls
      );
    }
    this.isNewRow = false;
  }

  /**
   * modifier la remise et calculer le prix remise
   * @param element FormGroup
   */
  public updateRemise(element: FormGroup<ITarificationRowForm>): void {
    if (element.controls.remise_euro.value > element.controls.prix_ttc.value) {
      element.controls.remise_euro.reset();
      this.toasterService.warning(
        this.translateService.instant('error.remiseSuperieurError')
      );
    } else {
      const selectedPrestation = this.prestations?.find(
        (presta: IPrestation) =>
          presta.code === element.controls.codeprestation.value
      );
      const selectedTVA = this.tvas?.find(
        (tva: ITva) => tva.id === selectedPrestation?.tva_id
      );
      element.controls.prixttcremise.setValue(
        TarificationHelper.calculateTTCRemise(
          selectedPrestation,
          element.controls.remise_euro.value,
          element.controls.remise_pourcentage.value,
          selectedTVA
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
