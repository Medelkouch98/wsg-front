import { FormControl } from '@angular/forms';

export interface IOptionalDropDownFormGroup {
  id: FormControl<number>;
  libelle: FormControl<string>;
}
