import { FormControl, FormGroup } from '@angular/forms';
import { TypePersonneEnum } from '@app/enums';

export interface IClientIdentificationFormGroup {
  id: FormControl<number>;
  type: FormControl<TypePersonneEnum>;
  civilite_id: FormControl<number>;
  nom: FormControl<string>;
  adresse: FormControl<string>;
  suite: FormControl<string>;
  cp: FormControl<string>;
  ville: FormControl<string>;
  fixe: FormControl<string>;
  mobile: FormControl<string>;
  email: FormControl<string>;
  centres: FormControl<number[]>;
  actif: FormControl<boolean>;
  clientPro: FormGroup<IClientProFormGroup>;
}

export interface IClientProFormGroup {
  code: FormControl<number>;
  siret: FormControl<string>;
  code_service: FormControl<string>;
  fax: FormControl<string>;
}
