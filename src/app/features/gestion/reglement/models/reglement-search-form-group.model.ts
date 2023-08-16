import { FormControl } from '@angular/forms';
import { TypePersonneEnum } from '@app/enums';

export interface IReglementSearchFormGroup {
  date_reglement_start: FormControl<string | Date>;
  date_reglement_end: FormControl<string | Date>;
  mode_reglement_id: FormControl<number>;
  numero_facture: FormControl<string>;
  nom_client: FormControl<string>;
  type_client: FormControl<TypePersonneEnum>;
  reference: FormControl<string>;
}
