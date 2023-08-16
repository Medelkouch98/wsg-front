import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { UserSelector } from '../../../../../core/store/auth/auth.selectors';
import { TypePersonneEnum } from '@app/enums';
import { AppState } from '../../../../../core/store/app.state';
import { ComptageDesEspecesComponent } from './comptage-des-especes/comptage-des-especes.component';
import { TypeComptageEnum } from '../../enums';
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgIf,
  UpperCasePipe,
} from '@angular/common';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { ClotureCaisseStore } from '../../cloture-caisse.store';
import {
  IClotureCaisseRequest,
  IClotureFormGroup,
  IComptageFormGroup,
  IComptageRowForm,
} from '../../models';
import { ControlesNonFacturesTableComponent } from './controles-non-factures-table/controles-non-factures-table.component';
import { MatDividerModule } from '@angular/material/divider';
import { RecapitulatifDesComptagesComponent } from './recapitulatif-des-comptages/recapitulatif-des-comptages.component';
import { MatCardModule } from '@angular/material/card';
import { ICurrentUser } from '@app/models';
import { MatExpansionModule } from '@angular/material/expansion';
import { GenericComptageFormComponent } from './generic-comptage-form/generic-comptage-form.component';
import { notAllRowsAreSavedValidator } from '../../validators/cloture-caisse.validator';

@Component({
  selector: 'app-create-cloture-caisse',
  standalone: true,
  imports: [
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    ComptageDesEspecesComponent,
    DecimalPipe,
    UpperCasePipe,
    NgIf,
    AsyncPipe,
    ControlesNonFacturesTableComponent,
    MatDividerModule,
    RecapitulatifDesComptagesComponent,
    MatCardModule,
    DatePipe,
    MatExpansionModule,
    GenericComptageFormComponent,
  ],
  templateUrl: './create-cloture-caisse.component.html',
})
export class CreateClotureCaisseComponent implements OnInit {
  TypeComptageEnum = TypeComptageEnum;
  TypePersonneEnum = TypePersonneEnum;
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  totalEspeces$: Observable<number> = this.clotureCaisseStore.totalEspeces$;
  showRecap: boolean = false;
  clotureCaisseRequest$: Observable<IClotureCaisseRequest> =
    this.clotureCaisseStore.clotureCaisseRequest$;
  fondDeCaisseEtEncaissementDuJour$: Observable<number> =
    this.clotureCaisseStore.fondDeCaisseEtEncaissementDuJour$;

  public currentUser$: Observable<ICurrentUser> = this.store.pipe(
    select(UserSelector)
  );

  public clotureForm: FormGroup<IClotureFormGroup>;
  constructor(
    private store: Store<AppState>,
    private clotureCaisseStore: ClotureCaisseStore,
    private fb: FormBuilder
  ) {
    this.createClotureForm();
  }
  /**
   * Créer le formulaire de cloture
   */
  createClotureForm() {
    this.clotureForm = this.fb.group({
      comptageDesEspecesBillets: this.createComptageForm(),
      comptageDesEspecesPieces: this.createComptageForm(),
      comptageDesSortiesDeCaisse: this.createComptageForm(),
      comptageDesCheques: this.createComptageForm(),
      comptageDesCarteBancaire: this.createComptageForm(),
      comptageDesPaiementsInternet: this.createComptageForm(),
      comptageDesVirements: this.createComptageForm(),
      comptageDesCoupons: this.createComptageForm(),
    });
  }

  ngOnInit(): void {
    this.clotureCaisseStore.getClotureDeCaisseInitialData();
  }

  /**
   * Créer le formulaire de comptage
   */
  createComptageForm(): FormGroup<IComptageFormGroup> {
    const form = this.fb.group({
      comptageRowsForm: this.fb.array([] as FormGroup<IComptageRowForm>[]),
    });
    form.setValidators(notAllRowsAreSavedValidator());
    return form;
  }

  /**
   * enregistrer la cloture de caisse
   */
  valider() {
    this.clotureCaisseStore.cloturerCaisse();
  }

  /**
   * vérifier les formulaires de comptages
   * @return boolean
   */
  public isValid(): boolean {
    if(this.clotureForm.invalid){
      this.showRecap=false;
    }
    return this.clotureForm.valid;
  }

  /**
   * recuperer les colonnes et les entêtes
   * @param {TypeComptageEnum} type
   * @return {Map<string, string>}
   */
  getColumnsAndHeaders(type: TypeComptageEnum): Map<string, string> {
    let columnsMap: Map<string, string> = new Map<string, string>([]);
    switch (type) {
      case TypeComptageEnum.TYPE_SORTIE_CAISSE:
        columnsMap = new Map<string, string>([
          ['nom', 'gestion.clotureCaisse.usage'],
          ['montant', 'commun.montant'],
        ]);
        break;
      case TypeComptageEnum.TYPE_CHEQUE:
        columnsMap = new Map<string, string>([
          ['banque', 'gestion.clotureCaisse.nomDeLaBanque'],
          ['nom', 'gestion.clotureCaisse.nomEmetteur'],
          ['numero', 'gestion.clotureCaisse.numCheque'],
          ['montant', 'commun.montant'],
        ]);
        break;
      case TypeComptageEnum.TYPE_CARTE_BANCAIRE:
        columnsMap = new Map<string, string>([
          ['nom', 'gestion.clotureCaisse.nomTPE'],
          ['numero', 'gestion.clotureCaisse.numRemise'],
          ['montant', 'gestion.clotureCaisse.montantDeRemise'],
        ]);
        break;
      case TypeComptageEnum.TYPE_INTERNET:
        columnsMap = new Map<string, string>([
          ['banque', 'gestion.clotureCaisse.nomDeLaBanque'],
          ['nom', 'gestion.clotureCaisse.nomEmetteur'],
          ['numero', 'gestion.clotureCaisse.numPaiement'],
          ['montant', 'commun.montant'],
        ]);
        break;
      case TypeComptageEnum.TYPE_VIREMENT:
        columnsMap = new Map<string, string>([
          ['banque', 'gestion.clotureCaisse.nomDeLaBanque'],
          ['nom', 'gestion.clotureCaisse.nomEmetteur'],
          ['numero', 'gestion.clotureCaisse.numVirement'],
          ['montant', 'commun.montant'],
        ]);
        break;
      case TypeComptageEnum.TYPE_COUPON:
        columnsMap = new Map<string, string>([
          ['numero', 'gestion.clotureCaisse.numCoupon'],
          ['nom', 'gestion.clotureCaisse.nomBeneficiaireCoupon'],
          ['montant', 'commun.montant'],
        ]);
        break;
    }
    columnsMap.set('actions', 'commun.actions');
    return columnsMap;
  }
}
