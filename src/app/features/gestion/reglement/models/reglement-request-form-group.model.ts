import { FormControl } from '@angular/forms';

export interface IReglementRequestFromGroup {
  id: FormControl<number>;
  mode_reglement_id: FormControl<number>;
  montant: FormControl<number>;
  date_reglement: FormControl<string | Date>;
  reference: FormControl<string>;
  factures: FormControl<number[]>;
}
