import { FormControl } from '@angular/forms';

export interface IClotureCaisseActionsFormGroup {
  date_debut: FormControl<string | Date>;
  date_fin: FormControl<string | Date>;
}
