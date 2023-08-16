import { FormControl, FormGroup } from '@angular/forms';
import { ICompteursActionFormGroup } from '.';
import { IOptionalDropDownDetails } from '../../../../shared/components/optional-dropdown/models';

export interface ICompteursAddFormGroup {
  justification: FormControl<IOptionalDropDownDetails>;
  actions: FormGroup<ICompteursActionFormGroup>;
  fichiers: FormControl<Blob[]>;
}
