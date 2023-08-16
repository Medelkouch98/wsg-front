import { FormControl } from '@angular/forms';

export interface IAdresseFormGroup {
  civilite_id: FormControl<number>;
  code: FormControl<number>;
  nom: FormControl<string>;
  adresse: FormControl<string>;
  suite: FormControl<string>;
  cp: FormControl<string>;
  ville: FormControl<string>;
  fixe: FormControl<string>;
  email: FormControl<string>;
}

export class AdresseFormGroup implements IAdresseFormGroup {
  civilite_id: FormControl<number>;
  code: FormControl<number>;
  nom: FormControl<string>;
  adresse: FormControl<string>;
  suite: FormControl<string>;
  cp: FormControl<string>;
  ville: FormControl<string>;
  fixe: FormControl<string>;
  email: FormControl<string>;

  constructor() {
    this.civilite_id = new FormControl<number>(null);
    this.code = new FormControl<number>(null);
    this.nom = new FormControl<string>('');
    this.adresse = new FormControl<string>('');
    this.suite = new FormControl<string>('');
    this.cp = new FormControl<string>('');
    this.ville = new FormControl<string>('');
    this.fixe = new FormControl<string>('');
    this.email = new FormControl<string>('');
  }
}
