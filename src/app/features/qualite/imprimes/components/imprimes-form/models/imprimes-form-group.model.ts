import { FormControl } from '@angular/forms';

export interface IImprimesFormGroup {
  premier_numero: FormControl<number>;
  dernier_numero: FormControl<number>;
  commentaire: FormControl<string>;
  agrement?: FormControl<string>;
  date?: FormControl<string>;
  type_liasse_id?: FormControl<number>;
}
export class ImprimesFormGroup implements IImprimesFormGroup {
  premier_numero: FormControl<number>;
  dernier_numero: FormControl<number>;
  commentaire: FormControl<string>;
  agrement?: FormControl<string>;
  date?: FormControl<string>;
  type_liasse_id?: FormControl<number>;
}
