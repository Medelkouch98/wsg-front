import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, transition, trigger } from '@angular/animations';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientStore } from '../../../client.store';
import {
  debounceTime,
  filter,
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { AppState } from '../../../../../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { IMarque, IModele, ITypeControle } from '@app/models';
import * as resourcesSelector from '../../../../../../core/store/resources/resources.selector';
import * as resourcesActions from '../../../../../../core/store/resources/resources.actions';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import * as moment from 'moment';
import {
  ClientHistoriqueGrouped,
  IClientHistorique,
  IClientHistoriqueGrouped,
  IHistorique,
  IHistoriqueFormGroup,
  IUpdateRelanceRequest,
} from '../../../models';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { TypeHistoriqueEnum } from '../../../enum';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { ClientsValidators } from '../../../validators/clients.validators';
import { CustomDateMaskDirective } from '@app/directives';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControlErrorPipe } from '@app/pipes';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ConfirmationPopupComponent } from '@app/components';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-client-historique',
  standalone: true,
  imports: [
    ConfirmationPopupComponent,
    NgIf,
    NgFor,
    AsyncPipe,
    DatePipe,
    TranslateModule,
    ReactiveFormsModule,
    CustomDateMaskDirective,
    NgClass,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonToggleModule,
    FormControlErrorPipe,
    MatSortModule,
  ],
  templateUrl: './client-historique.component.html',
  styleUrls: ['./client-historique.component.scss'],
  animations: [
    trigger('detailExpand', [
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ClientHistoriqueComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) sort: MatSort;
  marques$: Observable<IMarque[]> = this.store.pipe(
    select(resourcesSelector.MarquesSelector)
  );
  modeles$: Observable<IModele[]> = this.store.pipe(
    select(resourcesSelector.ModelesSelector)
  );
  filteredMarques$: Observable<IMarque[]>;
  filteredModeles$: Observable<IModele[]> = this.modeles$;
  dataSource = new MatTableDataSource<IClientHistoriqueGrouped>();
  columns = [
    'immatriculation',
    'marque',
    'modele',
    'numero_serie',
    'date_validite_vtp',
    'date_validite_vtc',
    'relancer',
    'actions',
  ];
  expandedElement: IClientHistoriqueGrouped | null;
  addForm: FormGroup<IHistoriqueFormGroup>;
  typeHistoriqueEnum = TypeHistoriqueEnum;
  MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private clientStore: ClientStore,
    private store: Store<AppState>,
    private clientsValidators: ClientsValidators,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.subscription.add(
      combineLatest([
        this.store.pipe(select(resourcesSelector.TypesControleSelector)),
        this.clientStore.historique$,
      ]).subscribe(
        ([typesControle, rows]: [ITypeControle[], IClientHistorique[]]) => {
          this.addForm.reset();
          this.dataSource.data = rows.reduce(
            (
              acc: IClientHistoriqueGrouped[],
              currentrow: IClientHistorique
            ) => {
              const currentHistorique = acc.find(
                (element: IClientHistoriqueGrouped) =>
                  element.immatriculation === currentrow['immatriculation']
              );
              currentHistorique
                ? (currentHistorique as ClientHistoriqueGrouped).addHistorique(
                    currentrow,
                    typesControle
                  )
                : acc.push(
                    new ClientHistoriqueGrouped(currentrow, typesControle)
                  );
              return acc;
            },
            []
          );
          this.dataSource.sort = this.sort;
        }
      )
    );
    this.filteredMarques$ = this.filterMarque();
    this.filteredModeles$ = this.filterModeles();
  }

  createForm() {
    this.addForm = this.fb.group(
      {
        immatriculation: ['', Validators.required],
        marque: [''],
        modele: [''],
        numero_serie: [''],
        date_validite_vtc: [''],
        date_validite_vtp: [''],
        parametre_relance: this.fb.nonNullable.control(1, Validators.required),
        isNewRow: this.fb.nonNullable.control(false),
      },
      {
        validators: [this.clientsValidators.dateValiditeRequiredValidator()],
      }
    );
  }

  /**
   * Ajouter une nouvelle ligne
   */
  addNewRow() {
    this.addForm.controls.isNewRow.setValue(true);
    this.dataSource.data = [
      this.addForm.getRawValue(),
      ...this.dataSource.data,
    ];
  }

  /**
   * Ajouter un prospect véhicule
   */
  save() {
    const { isNewRow, ...prospectVehicule } = this.addForm.getRawValue();
    prospectVehicule.date_validite_vtc = prospectVehicule.date_validite_vtc
      ? moment(prospectVehicule.date_validite_vtc, 'YYYY-MM-DD').format(
          'YYYY-MM-DD'
        )
      : null;
    prospectVehicule.date_validite_vtp = prospectVehicule.date_validite_vtp
      ? moment(prospectVehicule.date_validite_vtp, 'YYYY-MM-DD').format(
          'YYYY-MM-DD'
        )
      : null;
    this.clientStore.addProspectVehicule(prospectVehicule);
  }

  /**
   * annuler l'ajout
   * @param index number
   */
  cancel(index: number) {
    this.dataSource.data = this.dataSource.data.filter(
      (_, i: number) => i !== index
    );
    this.addForm.reset();
  }

  /**
   * Filter marque
   * @return Observable<IMarque[]>
   */
  filterMarque(): Observable<IMarque[]> {
    return this.addForm.controls.marque.valueChanges.pipe(
      // delay emits
      debounceTime(300),
      switchMap((value: string) =>
        this.marques$.pipe(
          map((marques: IMarque[]) =>
            marques.filter((row: IMarque) =>
              row.libelle.toLowerCase().includes(value?.toLowerCase())
            )
          )
        )
      )
    );
  }

  /**
   * Filter modele
   * @return Observable<IModele[]>
   */
  filterModeles(): Observable<IMarque[]> {
    return this.addForm.controls.modele.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      switchMap((value: string) =>
        this.modeles$.pipe(
          map((modeles: IModele[]) =>
            modeles.filter((row: IModele) =>
              row.libelle.toLowerCase().includes(value?.toLowerCase())
            )
          )
        )
      )
    );
  }

  /**
   * change relance sur
   * @param event MatButtonToggleChange
   * @param historique IHistorique
   */
  changeRelance(event: MatButtonToggleChange, historique: IHistorique) {
    // relance_sur prends 1, 2
    // parametre_relance prends 0, 1
    const data: IUpdateRelanceRequest = {
      relance_sur: event.value === 0 ? 1 : event.value,
      parametre_relance: event.value > 0 ? 1 : 0,
    };
    this.clientStore.updateRelance({ id: historique.id, data });
  }

  /**
   * Rediriger vers la fiche controle
   * @param idcontrole number
   */
  goToFicheControle(idcontrole: number) {
    this.clientStore.goToFicheControle(idcontrole);
  }

  /**
   * Permet d'emettre la valeur selectionne
   * @param event MatAutocompleteSelectedEvent
   */
  onSelectionChanged(event: MatAutocompleteSelectedEvent) {
    this.store.dispatch(
      resourcesActions.SearchModeleByMarque({
        marque: event.option.value,
      })
    );
  }

  /**
   * Suppression de prospect
   * @param id: number prospect id
   */
  deleteProspect(id: number) {
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
          take(1),
          filter((result: boolean) => !!result),
          tap(() => this.clientStore.deleteProspect({ id }))
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
