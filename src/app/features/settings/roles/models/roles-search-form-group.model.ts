import { FormControl } from '@angular/forms';
import { IRolesSearch, RolesSearch } from './roles-search.model';

export interface IRolesSearchFormGroup {
  nom: FormControl<string>;
  is_reference: FormControl<number>;
}

export class RolesSearchFormGroup implements IRolesSearchFormGroup {
  nom: FormControl<string>;
  is_reference: FormControl<number>;

  constructor(roleSearch: IRolesSearch = new RolesSearch()) {
    this.nom = new FormControl(roleSearch.nom);
    this.is_reference = new FormControl(roleSearch.is_reference);
  }
}
