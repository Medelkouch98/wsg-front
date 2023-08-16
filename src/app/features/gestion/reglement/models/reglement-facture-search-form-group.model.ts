import { FormControl } from '@angular/forms';
import {IClient, IFacture} from '@app/models';

export interface IFactureSearchFormGroup {
  start_date: FormControl<Date>;
  end_date: FormControl<Date>;
  client: FormControl<IClient>;
  factures: FormControl<IFacture[]>;
}
