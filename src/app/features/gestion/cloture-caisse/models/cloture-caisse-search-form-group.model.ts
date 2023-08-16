import { FormControl } from '@angular/forms';

export interface IClotureCaisseSearchFormGroup {
  date_debut: FormControl<string | Date>;
  date_fin: FormControl<string | Date>;
  fin_mois: FormControl<boolean>;
}
