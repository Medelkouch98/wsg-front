import { FormControl } from '@angular/forms';
import { TypeApporteurAffaire } from '@app/config';

export interface IApporeturAffaireIdentificationFormGroupModel {
  id: FormControl<number>;
  civilite_id: FormControl<number>;
  nom: FormControl<string>;
  code: FormControl<number>;
  adresse: FormControl<string>;
  suite: FormControl<string>;
  cp: FormControl<string>;
  ville: FormControl<string>;
  fixe: FormControl<string>;
  email: FormControl<string>;
  fax: FormControl<string>;
  mobile: FormControl<string>;
  actif: FormControl<boolean>;
  type: FormControl<TypeApporteurAffaire>;
}
