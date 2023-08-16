import { FormControl } from '@angular/forms';
import { IMaterialSearch, MaterialSearch } from './material-search.model';

export interface IMaterialSearchFormGroup {
  materiel_categorie_id: FormControl<number>;
  materiel_type_id: FormControl<number>;
  materiel_sous_type_id: FormControl<number>;
  actif: FormControl<number>;
}

export class MaterialSearchFormGroup implements IMaterialSearchFormGroup {
  materiel_categorie_id: FormControl<number>;
  materiel_type_id: FormControl<number>;
  materiel_sous_type_id: FormControl<number>;
  actif: FormControl<number>;

  constructor(materialSearch: IMaterialSearch = new MaterialSearch()) {
    this.materiel_categorie_id = new FormControl(
      materialSearch.materiel_categorie_id
    );
    this.materiel_type_id = new FormControl(materialSearch.materiel_type_id);
    this.materiel_sous_type_id = new FormControl(
      materialSearch.materiel_sous_type_id
    );
    this.actif = new FormControl(materialSearch.actif);
  }
}
