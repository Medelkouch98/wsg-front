import { FormControl } from '@angular/forms';
import { IUsersSearch, UsersSearch } from './users-search.model';

export interface IUsersSearchFormGroup {
  nom: FormControl<string>;
  prenom: FormControl<string>;
  agrement: FormControl<string>;
  actif: FormControl<number | string>;
  role_id: FormControl<string>;
}

export class UsersSearchFormGroup implements IUsersSearchFormGroup {
  nom: FormControl<string>;
  prenom: FormControl<string>;
  agrement: FormControl<string>;
  actif: FormControl<number | string>;
  role_id: FormControl<string>;
  constructor(userSearch: IUsersSearch = new UsersSearch()) {
    this.nom = new FormControl(userSearch.nom);
    this.prenom = new FormControl(userSearch.prenom);
    this.agrement = new FormControl(userSearch.agrement);
    this.actif = new FormControl(userSearch.actif);
    this.role_id = new FormControl(userSearch.role_id);
  }
}
