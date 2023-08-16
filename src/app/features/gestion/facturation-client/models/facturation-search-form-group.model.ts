import { FormControl } from '@angular/forms';
import { IClient } from '@app/models';

export interface IFacturationSearchFormGroup {
  start_date: FormControl<string>;
  end_date: FormControl<string>;
  client: FormControl<IClient>;
}
