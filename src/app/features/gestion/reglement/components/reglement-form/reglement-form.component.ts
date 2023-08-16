import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { ReglementStore } from '../../reglement.store';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CustomDateMaskDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControlErrorPipe } from '@app/pipes';
import { MatSelectModule } from '@angular/material/select';
import {
  IFactureSearchFormGroup,
  IReglement,
  IReglementRequest,
  IReglementRequestFromGroup,
} from '../../models';
import {
  Client,
  IClient,
  IFacture,
  IModeReglement,
  QueryParam,
} from '@app/models';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../core/store/app.state';
import { debounceTime, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { PermissionType, TypePersonneEnum } from '@app/enums';
import * as resourcesSelector from '../../../../../core/store/resources/resources.selector';
import { ClientAutocompleteComponent } from '@app/components';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { GlobalHelper } from '@app/helpers';
import { FactureAutocompleteComponent } from '../../../../../shared/components/facture-autocomplete/facture-autocomplete.component';
import * as moment from 'moment/moment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-reglement-form',
  standalone: true,
  templateUrl: './reglement-form.component.html',
  imports: [
    ReactiveFormsModule,
    ClientAutocompleteComponent,
    TranslateModule,
    MatFormFieldModule,
    FormControlErrorPipe,
    FactureAutocompleteComponent,
    NgIf,
    MatDividerModule,
    MatTableModule,
    DecimalPipe,
    MatButtonModule,
    AsyncPipe,
    MarkRequiredFormControlAsDirtyDirective,
    MatDatepickerModule,
    CustomDateMaskDirective,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    NgForOf,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class ReglementFormComponent implements OnInit, OnDestroy {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  today:Date = new Date();
  minDate:Date;
  @Input() addMode: boolean;
  dateChangedManually:boolean=false;
  subscription: Subscription = new Subscription();
  factureSearchFormGroup: FormGroup<IFactureSearchFormGroup>;
  reglementRequestFromGroup: FormGroup<IReglementRequestFromGroup>;
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE) && !this.addMode
    )
  );

  modesReglement$: Observable<IModeReglement[]> = this.store.pipe(
    select(resourcesSelector.ModesReglementsSelector)
  );

  dataSource = new MatTableDataSource<FormGroup<IReglementRequestFromGroup>>();
  public columns = [
    'date_reglement',
    'mode_reglement_id',
    'reference',
    'montant',
  ];

  public factureSearchParms$: BehaviorSubject<QueryParam> =
    new BehaviorSubject<QueryParam>(null);

  constructor(
    private fb: FormBuilder,
    private reglementStore: ReglementStore,
    private translateService: TranslateService,
    private toasterService: ToastrService,
    public store: Store<AppState>
  ) {
    this.createFactureSearchForm();
    this.createReglementForm();
  }

  ngOnInit(): void {
    if (!this.addMode) {
      this.reglementStore.getReglement();
    }
    this.subscription.add(
      this.reglementStore.reglement$
        .pipe(
          map((reglement: IReglement) => {
            this.dataSource = new MatTableDataSource();
            const reglementRequest: IReglementRequest = {
              id: reglement?.id,
              mode_reglement_id: reglement?.mode_reglement_id,
              date_reglement: reglement?.date_reglement,
              montant: reglement?.montant,
              reference: reglement?.reference,
              factures: reglement?.factures?.map((f) => f.id),
            };
            if (!this.addMode) {
              this.factureSearchFormGroup.controls.factures.patchValue(
                reglement?.factures,
                { emitEvent: false }
              );
              const client = new Client();
              client.id=reglement.client_id;
              client.nom=reglement.client_nom;
              this.factureSearchFormGroup.controls.client.patchValue(
                client,
                { emitEvent: false }
              );
              this.searchFactures();
              this.handleReglementType(reglement);
            }
            this.reglementRequestFromGroup.patchValue(reglementRequest);
            this.reglementRequestFromGroup.markAsPristine();

            this.dataSource.data.push(this.reglementRequestFromGroup);
          })
        )
        .subscribe()
    );

    this.handleInvoicesChange();

    this.subscription.add(
      this.factureSearchFormGroup.controls.client.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => {
          this.searchFactures();
        })
    );
  }

  /**
   * gestion d'affichage du reglement
   * RG23:
   *      Pour un client en compte:
   *          Lorsque l'utilisateur clique sur le bouton et que le règlement est lié à une
   *          facture/avoir alors un toaster "Impossible d'éditer le règlement car il est lié à
   *          une Facture/Avoir." apparaît
   *      Pour un client de passage:
   *          Lorsque l'utilisateur clique sur le bouton et que le règlement a été effectué dans
   *          Websur Contrôle alors un toaster "Impossible d'éditer le règlement d'un client
   *          passager effectué dans Websur Controle" apparaît.
   * @param {IReglement} reglement
   */
  handleReglementType(reglement: IReglement) {
    if (reglement?.client_type === TypePersonneEnum.COMPTE) {
      if (reglement?.factures?.some((f) => f.avoir)) {
        this.reglementRequestFromGroup.disable();
        this.toasterService.warning(
          this.translateService.instant(
            'gestion.errors.impossibleDEditerReglementFactureAvoir'
          )
        );
      }
    }
    if (reglement?.client_type === TypePersonneEnum.PASSAGE) {
      if (!!reglement?.websur_controle_id) {
        this.reglementRequestFromGroup.disable();
        this.toasterService.warning(
          this.translateService.instant(
            'gestion.errors.impossibleDEditerReglementWebSurControle'
          )
        );
      }
    }
  }

  /**
   * Gerer les changements de factures
   */
  handleInvoicesChange() {
    this.subscription.add(
      this.factureSearchFormGroup.controls.factures.valueChanges.subscribe(
        (factures: IFacture[]) => {
          // On prend les factures sélectionnées dans le formulaire de recherche et on les ajoutes
          // dans celui de règlement
          this.reglementRequestFromGroup.controls.factures.patchValue(
            factures?.map((f) => f.id)
          );
          if (factures.length > 0) {
            //if at least one invoice is selected we enable the request form & disable the client control
            this.reglementRequestFromGroup.enable();
            this.factureSearchFormGroup.controls.client.disable();
            if (factures.length === 1) {
              const facture = factures[0];
              //Si on a une facture, on peut en déduire la date et le client, et donc on fait un patch
              this.factureSearchFormGroup.controls.start_date.patchValue(
                new Date(facture.date_facture),
                { emitEvent: false }
              );
              this.factureSearchFormGroup.controls.end_date.patchValue(
                new Date(facture.date_facture),
                { emitEvent: false }
              );
              this.dateChangedManually=false;
              const client: IClient = new Client();
              client.id = facture.client_id;
              client.nom = facture.nom_client;
              this.factureSearchFormGroup.controls.client.setValue(client, {
                emitEvent: false,
              });
            } else {
              this.factureSearchFormGroup.controls.start_date.reset();
              this.factureSearchFormGroup.controls.end_date.reset();
            }
          } else {
            //if no invoice is selected we disable the request form & enable the client control
            this.reglementRequestFromGroup.disable();
            this.factureSearchFormGroup.controls.client.enable();

            if(!this.dateChangedManually){
              //Si vide les champs date
              this.factureSearchFormGroup.controls.start_date.reset();
              this.factureSearchFormGroup.controls.end_date.reset();
              this.dateChangedManually=false;
            }
          }
          this.completerMontant();
          this.minDate =  factures.reduce((dateFactureMax:Date, obj:IFacture) => {
            const objDate = new Date(obj.date_facture);
            return objDate > dateFactureMax ? objDate : dateFactureMax;
          }, null);
        }
      )
    );
  }
  /**
   * envoyer les filtres (client, date) au composant "facture-autocomplete" pour faire la recherche
   */
  searchFactures() {
    const value = this.factureSearchFormGroup.value;
    let params: QueryParam = {};
    if (value.client) {
      params.client_id = value.client.id;
    }
    if (value.start_date) {
      params.start_date = moment(value.start_date, 'YYYY-MM-DD').format(
        'YYYY-MM-DD'
      );
    }
    if (value.end_date) {
      params.end_date = moment(value.start_date, 'YYYY-MM-DD').format(
        'YYYY-MM-DD'
      );
    }
    this.factureSearchParms$.next(params);
  }

  /**
   * valider le reglement
   */
  validerReglement() {
    if (this.addMode) {
      this.reglementStore.addReglement(
        this.reglementRequestFromGroup?.getRawValue()
      );
    } else {
      // modifier le reglement
      let updatedValues = {};
      GlobalHelper.getUpdatedControles(
        this.reglementRequestFromGroup,
        updatedValues
      );
      //mode update : on fait un patch directement
      this.reglementStore.updateReglement({
        id: this.reglementRequestFromGroup.value.id,
        data: updatedValues,
      });
    }
  }

  /**
   * sélectionner la date de début comme date de fin si l'utilisateur sélectionne uniquement la date début
   */
  setDateRange() {
    const startDate = this.factureSearchFormGroup.get('start_date').value;
    const endDate = this.factureSearchFormGroup.get('end_date').value;

    // Update the value of end_date if it's empty
    if (!endDate) {
      this.factureSearchFormGroup.get('end_date').setValue(startDate);
    }
    this.searchFactures();
    this.dateChangedManually=true;
  }

  /**
   * creation d'ajout de reglement
   */
  private createReglementForm() {
    this.reglementRequestFromGroup = this.fb.group({
      id: new FormControl(null),
      mode_reglement_id: new FormControl(null, Validators.required),
      montant: new FormControl(null, Validators.required),
      date_reglement: new FormControl(null, Validators.required),
      reference: new FormControl(null, Validators.required),
      factures: new FormControl(null, Validators.required),
    });
    if(this.addMode){
      //par défaut le formulaire de règlement est désactivé jusqu'à la sélection d'une facture
      this.reglementRequestFromGroup.disable();
    }
  }
  /**
   * creation d'ajout de reglement
   */
  private createFactureSearchForm() {
    this.factureSearchFormGroup = this.fb.group({
      start_date: new FormControl(null),
      end_date: new FormControl(null),
      client: new FormControl(null),
      factures: new FormControl(null, Validators.required),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reglementStore.initialiseReglement();
  }

  /**
   * calculer le total des factures
   * @return {number}
   */
  getTotal(): number {
    return +this.factureSearchFormGroup.value.factures
      ?.map((facture) => facture.solde)
      .reduce((sum, solde) => sum + solde, 0)?.toFixed(2);
  }

  /**
   * récupérer le montant réglé
   * @return {number}
   */
  getMontantRegle(): number {
    return this.reglementRequestFromGroup.value?.montant ?? 0;
  }

  /**
   * calculer le montant restant
   * @return {number}
   */
  getMontantRestant(): number {
    return this.getTotal() - this.getMontantRegle();
  }

  /**
   * compléter automatiquement le champ montant par la somme des factures sélectionnées
   */
  completerMontant() {
    this.reglementRequestFromGroup.controls.montant.setValue(this.getTotal());
  }
}
