import { FormControl, Validators } from '@angular/forms';
import { ClientSearch, IClientSearch } from './client-search.model';

export interface IClientSearchFormGroup {
  type: FormControl<string>;
  nom: FormControl<string>;
  ville: FormControl<string>;
  code: FormControl<string>;
  cp: FormControl<string>;
  actif: FormControl<number>;
  // dans le cas de recherche avec tri et pagination
  sort?: FormControl<string>;
  order?: FormControl<string>;
  per_page?: FormControl<number>;
  page?: FormControl<number>;
}
export class ClientSearchFormGroup implements IClientSearchFormGroup {
  type: FormControl<string>;
  nom: FormControl<string>;
  ville: FormControl<string>;
  code: FormControl<string>;
  cp: FormControl<string>;
  actif: FormControl<number>;
  // dans le cas de recherche avec tri et pagination
  sort?: FormControl<string>;
  order?: FormControl<string>;
  per_page?: FormControl<number>;
  page?: FormControl<number>;
  constructor(userSearch: IClientSearch = new ClientSearch()) {
    this.type = new FormControl(userSearch.type);
    this.nom = new FormControl(userSearch.nom);
    this.ville = new FormControl(userSearch.ville);
    this.code = new FormControl(userSearch.code);
    this.cp = new FormControl(userSearch.cp, Validators.maxLength(5));
    this.actif = new FormControl(userSearch.actif);
  }
}
