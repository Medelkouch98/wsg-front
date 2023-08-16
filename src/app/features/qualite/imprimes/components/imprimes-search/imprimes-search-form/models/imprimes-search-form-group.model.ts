import { EtatCartonLiasseEnum, EtatImprimesEnum } from '../../../../enum';
import { FormControl, Validators } from '@angular/forms';
import {
  IImprimesSearchForm,
  ImprimesSearchForm,
} from './imprimes-search-form.model';

export interface IImprimesSearchFormGroup {
  numero_liasse: FormControl<number>;
  mois: FormControl<number>;
  annee: FormControl<number>;
  carton_ferme: FormControl<EtatCartonLiasseEnum>;
  etat: FormControl<EtatImprimesEnum>;
}
export class ImprimesSearchFormGroup implements IImprimesSearchFormGroup {
  numero_liasse: FormControl<number>;
  mois: FormControl<number>;
  annee: FormControl<number>;
  carton_ferme: FormControl<EtatCartonLiasseEnum>;
  etat: FormControl<EtatImprimesEnum>;

  constructor(
    imprimesSearchForm: IImprimesSearchForm = new ImprimesSearchForm()
  ) {
    this.numero_liasse = new FormControl<number>(
      imprimesSearchForm.numero_liasse,
      Validators.maxLength(9)
    );
    this.mois = new FormControl<number>(imprimesSearchForm.mois);
    this.annee = new FormControl<number>(imprimesSearchForm.annee);
    this.carton_ferme = new FormControl<EtatCartonLiasseEnum>(
      imprimesSearchForm.carton_ferme
    );
    this.etat = new FormControl<EtatImprimesEnum>(imprimesSearchForm.etat);
  }
}
