import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface ITarificationFormGroup {
  tarificationRowsForm: FormArray<FormGroup<ITarificationRowForm>>;
}

export interface ITarificationRowForm {
  id: FormControl<number>;
  prestation_id: FormControl<number>;
  codeprestation: FormControl<string>;
  libelleprestation: FormControl<string>;
  prix_ht: FormControl<number>;
  prix_ttc: FormControl<number>;
  remise_euro: FormControl<number>;
  remise_pourcentage: FormControl<number>;
  prixttcremise: FormControl<number>;
  isEditable: FormControl<boolean>;
}
