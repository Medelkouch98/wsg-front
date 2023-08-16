import { FormControl } from '@angular/forms';
import { IOptionalDropDownDetails } from '../../../../shared/components/optional-dropdown/models';

export interface ICompteursActionFormGroup {
  action_corrective: FormControl<IOptionalDropDownDetails>;
  action_preventive: FormControl<IOptionalDropDownDetails>;
}
