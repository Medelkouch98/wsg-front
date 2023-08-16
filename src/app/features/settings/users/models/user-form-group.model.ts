import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormGroupValue } from '@app/types';
import { IControleurFormGroup } from './controleur-form-group.model';

export interface IUserFormGroup {
  nom: FormControl<string>;
  prenom: FormControl<string>;
  email: FormControl<string>;
  civilite_id: FormControl<number>;
  centres: FormArray<
    FormGroup<{ id: FormControl<boolean>; role_id: FormControl<number> }>
  >;
  login: FormControl<string>;
  actif: FormControl<boolean>;
  mobile: FormControl<string>;
  is_controleur: FormControl<boolean>;
  desactivation_motif_id: FormControl<number>;
  desactivation_motif_text: FormControl<string>;
  controleur?: FormGroup<IControleurFormGroup>;
}

export type IUserFormGroupValue = FormGroupValue<FormGroup<IUserFormGroup>>;
