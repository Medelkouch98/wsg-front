import { FormControl, FormGroup } from '@angular/forms';
import { FormGroupValue } from '@app/types';
import { IMaterialEventFichier } from './material-event-fichier.model';

export interface IMaterialEventSelectionFormGroup {
  materiels: FormControl<number[]>;
  materiel_evenement_type_id: FormControl<number>;
  date: FormControl<string>;
  materiel_evenement_fichiers?: FormControl<IMaterialEventFichier[]>;
}

export type IMaterialEventSelection = FormGroupValue<
  FormGroup<IMaterialEventSelectionFormGroup>
>;
