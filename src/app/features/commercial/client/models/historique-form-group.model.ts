import { FormControl } from '@angular/forms';

export interface IHistoriqueFormGroup {
  immatriculation: FormControl<string>;
  marque: FormControl<string>;
  modele: FormControl<string>;
  numero_serie: FormControl<string>;
  date_validite_vtc: FormControl<string>;
  date_validite_vtp: FormControl<string>;
  parametre_relance: FormControl<number>;
  isNewRow: FormControl<boolean>;
}
