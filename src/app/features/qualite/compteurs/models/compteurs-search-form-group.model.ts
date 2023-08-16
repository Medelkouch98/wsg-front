import { FormControl } from '@angular/forms';
import { ISearchCriteria, SearchCriteria } from './search-criteria.model';

export interface ICompteursSearchFormGroup {
  state: FormControl<string>;
  niveau: FormControl<number>;
  month: FormControl<number>;
  year: FormControl<number>;
  agrement_controleur: FormControl<string>;
}

export class CompteursSearchFormGroup implements ICompteursSearchFormGroup {
  state: FormControl<string>;
  niveau: FormControl<number>;
  month: FormControl<number>;
  year: FormControl<number>;
  agrement_controleur: FormControl<string>;

  constructor(compteurSearch: ISearchCriteria = new SearchCriteria()) {
    this.niveau = new FormControl(compteurSearch.niveau);
    this.state = new FormControl(compteurSearch.state);
    this.month = new FormControl(compteurSearch.month);
    this.year = new FormControl(compteurSearch.year);
    this.agrement_controleur = new FormControl(
      compteurSearch.agrement_controleur
    );
  }
}
