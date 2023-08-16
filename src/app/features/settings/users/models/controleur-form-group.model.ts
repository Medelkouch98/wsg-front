import { FormArray, FormControl } from '@angular/forms';

export interface IControleurFormGroup {
  agrement_vl: FormControl<string>;
  centres_controle: FormArray<FormControl<boolean>>;
  date_debut_agrement: FormControl<Date | string>;
  date_fin_agrement: FormControl<Date | string>;
  agrement_centre_rattachement: FormControl<string>;
  adresse: FormControl<string>;
  suite: FormControl<string>;
  ville: FormControl<string>;
  cp: FormControl<number>;
  habilitation_gaz: FormControl<boolean>;
  habilitation_electrique: FormControl<boolean>;
  reset_password: FormControl<boolean>;
}
