import { FormControl } from '@angular/forms';

export interface IReleveFactureSearchFormGroup {
  start_date: FormControl<string | Date>;
  end_date: FormControl<string | Date>;
  negocie_en: FormControl<number>;
  client_denomination: FormControl<string>;
  facture_status: FormControl<number>;
  releve: FormControl<number>;
}
