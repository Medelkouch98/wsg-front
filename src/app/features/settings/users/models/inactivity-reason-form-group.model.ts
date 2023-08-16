import { FormControl } from '@angular/forms';
import { IOptionalDropDownDetails } from './../../../../shared/components/optional-dropdown/models/optional-dropdown-details';
export interface IInactivityReasonFormGroup {
  reason: FormControl<IOptionalDropDownDetails>;
}
