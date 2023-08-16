import { TypeApporteurAffaire } from '@app/config';
import { FormControl } from '@angular/forms';

export interface IApporteurAffaireSearchFormGroupModel {
  code: FormControl<string>;
  type: FormControl<TypeApporteurAffaire>;
  nom: FormControl<string>;
  actif: FormControl<string>;
}
