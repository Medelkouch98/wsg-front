import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CustomDateMaskDirective } from '@app/directives';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import {
  IApporteurAffaire,
  IClient,
  IDetailPrestation,
  IEcheance,
  IFacture,
  IPrestation,
  IPrestationFacture,
} from '@app/models';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { FacturationState, FacturationStore } from './facturation.store';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FacturationTableComponent } from './components/facturation-table/facturation-table.component';
import { PermissionType, TypePersonneEnum } from '@app/enums';
import { filter, map, take, tap } from 'rxjs/operators';

import { AddPrestationPopupComponent } from './components/add-prestation/add-prestation-popup.component';
import { getDetailsPrestationFromMap } from './helper/facture.helper';
import {
  initPrestationsForm,
  FactureRequest,
  IFactureRequest,
  IPrestationFormGroup,
  IPrestationRowsForm,
} from './models';
import { FormControlErrorPipe } from '@app/pipes';
import { FactureTypeEnum } from './enums';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FacturationValidator } from './validators/facturation.validator';
import { ApporteurAffaireAutocompleteComponent } from '../../../shared/components/apporteur-affaire-autocomplete/apporteur-affaire-autocomplete.component';
import { ClientAdresseFormDialogComponent } from '../../../shared/components/client-adresse-form/client-adresse-form-dialog.component';
import { ClientAdresseFormComponent } from '../../../shared/components/client-adresse-form/client-adresse-form.component';
import * as resourcesSelector from '../../../core/store/resources/resources.selector';
import { AppState } from '../../../core/store/app.state';
import * as AuthSelector from '../../../core/store/auth/auth.selectors';
import { formaterDate } from '@app/helpers';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [
    MatCardModule,
    TranslateModule,
    MatInputModule,
    MatDatepickerModule,
    CustomDateMaskDirective,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatSelectModule,
    NgFor,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    ApporteurAffaireAutocompleteComponent,
    ClientAdresseFormDialogComponent,
    ClientAdresseFormComponent,
    DatePipe,
    FormControlErrorPipe,
    MatTooltipModule,
    FacturationTableComponent,
  ],
  templateUrl: './facturation.component.html',
  providers: [FacturationStore, FacturationValidator],
})
export class FacturationComponent implements OnInit, OnDestroy {
  @Input() dataFacture$: Observable<IFacture>;
  @Input() factureType: FactureTypeEnum = FactureTypeEnum.REFACTURATION;
  @Output() action: EventEmitter<IFactureRequest> =
    new EventEmitter<IFactureRequest>();
  public echeances$: Observable<IEcheance[]> = this.store.pipe(
    select(resourcesSelector.EcheancesSelector)
  );
  public dateFacture$: Observable<string> = this.facturationStore.dateFacture$;
  public numeroFacture$: Observable<string> =
    this.facturationStore.numeroFacture$;
  public client$: Observable<IClient> = this.facturationStore.client$;
  public detailsSelection$: Observable<
    Map<string, Map<number, IDetailPrestation>>
  > = this.facturationStore.detailsSelection$;
  public isReadOnly = false;
  public initialFacture: IFacture;
  public showEcheanceSelect = true;
  public echeanceControl = new FormControl<string | IEcheance>(
    '',
    Validators.required
  );
  public apporteurAffaireControl = new FormControl<string | IApporteurAffaire>(
    ''
  );
  public clientControl = new FormControl<IClient>(null);
  public observationControl = new FormControl<string>('');
  public dateEcheance: string;
  public TypePersonneEnum = TypePersonneEnum;
  public FactureTypeEnum = FactureTypeEnum;
  public prestationsForm: FormGroup<IPrestationFormGroup>;
  public subscription: Subscription = new Subscription();
  constructor(
    private store: Store<AppState>,
    private facturationStore: FacturationStore,
    public translateService: TranslateService,
    private matDialog: MatDialog,
    private fb: FormBuilder,
    private facturationValidator: FacturationValidator,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.echeanceControl.markAsDirty({ onlySelf: true });
    this.echeanceControl.markAsTouched();

    this.facturationStore.setFactureType(this.factureType);

    this.subscription.add(
      this.dataFacture$?.subscribe((facture: IFacture) => {
        this.initialFacture = facture;
        this.facturationStore.setFactureData(facture);
        this.clientControl.setValue(facture?.client);
      })
    );

    this.subscription.add(
      this.facturationStore.prestations$.subscribe(
        (prestationsFacture: IPrestationFacture[]) => {
          this.createPrestationsForm();
          this.prestationsForm = initPrestationsForm(
            prestationsFacture,
            this.fb,
            this.facturationValidator
          );
        }
      )
    );

    this.subscription.add(
      combineLatest([
        this.facturationStore.observation$,
        this.facturationStore.client$,
      ])
        .pipe(
          tap(([observation, client]: [string, IClient]) => {
            this.observationControl.setValue(observation);
            this.clientControl.setValue(client);
          })
        )
        .subscribe()
    );
    this.subscription.add(
      this.facturationStore.dateEcheance$
        .pipe(
          tap((dateEcheance: string) => {
            this.dateEcheance = dateEcheance;
            if (!dateEcheance) {
              this.echeanceControl.setValue('');
              this.showEcheanceSelect = true;
            } else {
              this.showEcheanceSelect = false;
            }
          })
        )
        .subscribe()
    );

    this.subscription.add(
      this.store
        .pipe(
          select(AuthSelector.AccessPermissionsSelector),
          map(
            (accessPermissions: PermissionType[]) =>
              !accessPermissions.includes(PermissionType.WRITE)
          )
        )
        .subscribe((isReadOnly: boolean) => {
          this.isReadOnly = isReadOnly;
          if (this.isReadOnly) {
            this.observationControl.disable();
            this.apporteurAffaireControl.disable();
            this.echeanceControl.disable();
          }
        })
    );
  }

  /**
   * Créer le formulaire prestations form
   * @private
   */
  private createPrestationsForm() {
    this.prestationsForm = this.fb.group({
      prestationsRowsForm: this.fb.array(
        [] as FormGroup<IPrestationRowsForm>[]
      ),
    });
  }

  /**
   * Calculer la date echeance
   * @param event MatSelectChange
   */
  calcEcheance(event: MatSelectChange) {
    this.showEcheanceSelect = false;
    this.facturationStore.setDateEcheance(event.value);
  }

  /**
   * Ouvrir la popup Modifier le client
   */
  editClient() {
    this.subscription.add(
      this.matDialog
        .open(ClientAdresseFormDialogComponent, {
          minWidth: this.breakpointObserver.isMatched('(max-width: 1024px)')
            ? '75%'
            : '50%',
          disableClose: true,
          data: {
            clientControl: this.clientControl,
            typePersonne: TypePersonneEnum.COMPTE,
            // Ne pas afficher le checkbox Passage si on a plusieurs lignes de prestations
            showPassage:
              !this.initialFacture ||
              (this.initialFacture?.prestations?.length === 1 &&
                this.initialFacture?.prestations[0]?.details.length === 1),
          },
        })
        .afterClosed()
        .pipe(
          filter(Boolean),
          tap(() => {
            this.facturationStore.setClient(this.clientControl.value);
            // Appliquer les remises de client pro
            if (this.clientControl.value.clientPro) {
              this.facturationStore.attachRemiseClientToPrestations();
            }
          })
        )
        .subscribe()
    );
  }

  /**
   * Modifier l'observation
   */
  setObservation() {
    this.facturationStore.setObsevation(this.observationControl.value);
  }

  /**
   * Réinitialiser la facture
   */
  resetFacture() {
    this.facturationStore.setFactureData(this.initialFacture);
    this.facturationStore.patchState({ detailsSelection: new Map() });
  }

  /**
   * Ajouter une prestation
   */
  addPrestation() {
    const dialogRef = this.matDialog.open(AddPrestationPopupComponent, {
      data: { code: 'DI', add: true },
      disableClose: true,
      minWidth: this.breakpointObserver.isMatched('(max-width: 1024px)')
        ? '75%'
        : '50%',
    });
    this.subscription.add(
      dialogRef
        .afterClosed()
        .pipe(
          take(1),
          filter(
            (result: { newPrestation: IPrestation; tauxTva: string }) =>
              !!result.newPrestation
          ),
          tap((result: { newPrestation: IPrestation; tauxTva: string }) =>
            this.facturationStore.addPrestationDiverse(result)
          )
        )
        .subscribe()
    );
  }

  /**
   * Valider la facture
   */
  saveFacture() {
    this.subscription.add(
      this.facturationStore.state$
        .pipe(
          take(1),
          map((state: FacturationState) => {
            const prestations: IDetailPrestation[] = [];
            const prestations_divers: IDetailPrestation[] = [];
            getDetailsPrestationFromMap(state.detailsSelection).forEach(
              (detail: IDetailPrestation) => {
                const {
                  reotc,
                  immatriculation,
                  proprietaire,
                  numero_bon_livraison,
                  ...prestation
                } = detail;
                // stocker les prestations diverses dans prestations_divers array
                if (prestation.code_prestation.toUpperCase().includes('DI')) {
                  prestations_divers.push(prestation);
                } else {
                  prestations.push(prestation);
                }
                if (reotc) prestations.push(reotc);
              }
            );
            return new FactureRequest({
              dateEcheance: state.dateEcheance,
              dateFacture: formaterDate(state?.dateFacture),
              observation: state.observation,
              client: state.client,
              totalFacture: state.totalFacture[0].totalPrestation,
              prestations,
              prestations_divers,
            });
          }),
          tap((facture: IFactureRequest) => this.action.emit(facture))
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
