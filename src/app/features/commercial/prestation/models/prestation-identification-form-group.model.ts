import { FormControl, FormGroup } from '@angular/forms';
import { IPrestationAgendaFormGroup } from './prestation-agenda-form-group.model';

export interface IPrestationIdentificationFormGroup {
  id: FormControl<number>;
  libelle: FormControl<string>;
  code: FormControl<string>;
  numero_comptable: FormControl<string>;
  actif: FormControl<boolean>;
  prix_ht: FormControl<string>; //To do: should number on backend
  prix_ttc: FormControl<string>; //To do: should number on backend
  prestation_divers: FormControl<boolean>;
  prestation_agenda_id: FormControl<number>;
  soumis_redevance: FormControl<boolean>;
  duree: FormControl<number>;
  tva_id: FormControl<number>;
  familles: FormControl<number[]>;
  agenda: FormGroup<IPrestationAgendaFormGroup>;
}
