import { FormControl } from '@angular/forms';

export interface IImmatriculationControlFormGroupModel {
  formatSivFni: FormControl<boolean>;
  immatriculation: FormControl<string>;
}
