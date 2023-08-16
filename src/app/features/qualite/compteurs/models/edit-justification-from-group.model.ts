import { FormControl } from '@angular/forms';
import { IOptionalDropDownDetails } from '../../../../shared/components/optional-dropdown/models';

export interface IEditJustificationFormGroup {
  justification: FormControl<IOptionalDropDownDetails>;
}
