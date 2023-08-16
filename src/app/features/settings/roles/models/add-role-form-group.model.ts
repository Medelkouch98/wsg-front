import { FormControl } from '@angular/forms';
import { IRole } from '@app/models';

export interface IAddRoleFormGroup {
  label: FormControl<string>;
  role: FormControl<IRole>;
}
