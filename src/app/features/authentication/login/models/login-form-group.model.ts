import { FormControl } from '@angular/forms';

export interface ILoginFormGroupModel {
  login: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}
