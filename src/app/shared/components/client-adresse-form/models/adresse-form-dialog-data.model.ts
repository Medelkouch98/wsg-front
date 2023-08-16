import { FormControl } from '@angular/forms';
import { IClient } from '@app/models';
import { TypePersonneEnum } from '@app/enums';

export interface IAdresseFormDialogData {
  clientControl: FormControl<IClient>;
  typePersonne: TypePersonneEnum;
  showPassage: boolean;
}
