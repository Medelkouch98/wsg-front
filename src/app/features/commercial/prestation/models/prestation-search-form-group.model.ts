import { FormControl } from '@angular/forms';
import {
  IPrestationsSearchRequestForm,
  PrestationsSearchRequestForm,
} from './prestation-search-request.model';

export interface IPrestationSearchFormGroup {
  actif: FormControl<number>;
  code: FormControl<string>;
  libelle: FormControl<string>;
  soumis_redevance: FormControl<number>;
}

export class PrestationSearchFormGroup implements IPrestationSearchFormGroup {
  actif: FormControl<number>;
  code: FormControl<string>;
  libelle: FormControl<string>;
  soumis_redevance: FormControl<number>;
  constructor(
    userSearch: IPrestationsSearchRequestForm = new PrestationsSearchRequestForm()
  ) {
    this.actif = new FormControl(userSearch.actif);
    this.code = new FormControl(userSearch.code);
    this.libelle = new FormControl(userSearch.libelle);
    this.soumis_redevance = new FormControl(userSearch.soumis_redevance);
  }
}
