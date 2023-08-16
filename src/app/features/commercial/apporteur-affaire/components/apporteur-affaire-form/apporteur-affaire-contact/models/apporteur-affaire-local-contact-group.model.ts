import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface IApporteurAffaireLocalFormGroup {
  contacts: FormArray<FormGroup<IApporteurAffaireLocalContactRowForm>>;
}

export interface IApporteurAffaireLocalContactRowForm {
  id: FormControl<number>;
  nom: FormControl<string>;
  prenom: FormControl<string>;
  fixe: FormControl<string>;
  mobile: FormControl<string>;
  email: FormControl<string>;
  fonction: FormControl<string>;
  civilite_id: FormControl<number>;
  isEditable: FormControl<boolean>;
}
