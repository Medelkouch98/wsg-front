import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { TypeComptageEnum } from '../enums';
import { ISimpleFacture } from './cloture-caisse-initial-data.model';
import { IComptage } from './cloture-caisse-request.model';
import { ClotureCaisseHelper } from '../helpers/cloture-caisse.helper';

export interface IComptageFormGroup {
  comptageRowsForm: FormArray<FormGroup<IComptageRowForm>>;
}
export interface IClotureFormGroup {
  comptageDesEspecesBillets: FormGroup<IComptageFormGroup>;
  comptageDesEspecesPieces: FormGroup<IComptageFormGroup>;
  comptageDesSortiesDeCaisse: FormGroup<IComptageFormGroup>;
  comptageDesCheques: FormGroup<IComptageFormGroup>;
  comptageDesCarteBancaire: FormGroup<IComptageFormGroup>;
  comptageDesPaiementsInternet: FormGroup<IComptageFormGroup>;
  comptageDesVirements: FormGroup<IComptageFormGroup>;
  comptageDesCoupons: FormGroup<IComptageFormGroup>;
}

export interface IComptageRowForm {
  type: FormControl<TypeComptageEnum>;
  montant: FormControl<number>;
  valeur?: FormControl<number>;
  nombre?: FormControl<number>;
  banque?: FormControl<string>;
  nom?: FormControl<string>;
  numero?: FormControl<number>;

  isEditable?: FormControl<boolean>;
  isNew?: FormControl<boolean>;
  factures?: FormControl<ISimpleFacture[]>;
}
export class ComptageRowForm implements IComptageRowForm {
  type: FormControl<TypeComptageEnum>;
  montant: FormControl<number>;
  valeur?: FormControl<number>;
  nombre?: FormControl<number>;
  banque?: FormControl<string>;
  nom?: FormControl<string>;
  numero?: FormControl<number>;

  isEditable?: FormControl<boolean>;
  isNew?: FormControl<boolean>;
  factures?: FormControl<ISimpleFacture[]>;

  constructor(comptage: IComptage) {
    this.type = new FormControl<TypeComptageEnum>(comptage?.type);
    this.montant = new FormControl<number>(comptage?.montant, [
      Validators.required,
      Validators.min(0),
    ]);
    this.nom = new FormControl<string>(comptage?.nom);
    this.banque = new FormControl<string>(comptage?.banque);
    this.numero = new FormControl<number>(comptage?.numero);
    this.valeur = new FormControl<number>(comptage?.valeur);
    this.nombre = new FormControl<number>(comptage?.nombre);
    this.isEditable = new FormControl<boolean>(comptage?.isEditable);
    this.isNew = new FormControl<boolean>(comptage?.isNew);
    //this data is needed to display factures in a popup
    this.factures = new FormControl<ISimpleFacture[]>(comptage?.factures);

    ClotureCaisseHelper.setComptageRowFormValidators(comptage?.type, this);
  }
}
