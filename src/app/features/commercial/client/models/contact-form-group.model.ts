import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface IContactFormGroup {
  contactRowsForm: FormArray<FormGroup<IContactRowForm>>;
}

export interface IContactRowForm {
  id: FormControl<number>;
  civilite_id: FormControl<number>;
  nom: FormControl<string>;
  prenom: FormControl<string>;
  fonction: FormControl<string>;
  fixe: FormControl<string>;
  mobile: FormControl<string>;
  email: FormControl<string>;
  recoit_bl: FormControl<boolean>;
  recoit_commercial: FormControl<boolean>;
  recoit_facture: FormControl<boolean>;
  recoit_relance: FormControl<boolean>;
  client_pro_id: FormControl<number>;
  isEditable: FormControl<boolean>;
}
