import { FormControl, FormGroup } from '@angular/forms';
import { FormGroupValue } from '@app/types';
import { IMaterialEventFichier } from './material-event-fichier.model';
import { IMaterialCharacteristic } from './material-characteristic.model';
import { IMaterialMaintenanceCompany } from './material-maintenance-company.model';
import { IMaterialEvent } from './material-event.model';

export interface IMaterialFormGroup {
  materiel_categorie_id: FormControl<number>;
  materiel_type_id: FormControl<number>;
  materiel_sous_type_id: FormControl<number>;
  marque: FormControl<string>;
  modele: FormControl<string>;
  numero_serie: FormControl<string>;
  materiel_societe_maintenance_id: FormControl<number>;
  materiel_caracteristiques?: FormControl<IMaterialCharacteristic[]>;
  materiel_evenements?: FormControl<IMaterialEvent[]>;
  societe_maintenance?: FormControl<IMaterialMaintenanceCompany>;
}

export interface IMaterialCharacteristicFormGroup {
  id: FormControl<number>;
  libelle?: FormControl<string>;
  choix?: FormControl<string[]>;
  valeur: FormControl<string>;
}
export interface IMaterialEventFormGroup {
  id?: FormControl<number>;
  materiel_id?: FormControl<number>;
  materiel_evenement_type_id: FormControl<number>;
  libelle?: FormControl<string>;
  date: FormControl<string>;
  observation?: FormControl<string>;
  materiel_evenement_fichiers?: FormControl<IMaterialEventFichier[]>;
}

export interface IMaterialMaintenanceCompanyFormGroup {
  id: FormControl<number>;
  nom: FormControl<string>;
  telephone: FormControl<string>;
  email: FormControl<string>;
}

export type IMaterialFormGroupValue = FormGroupValue<
  FormGroup<IMaterialFormGroup>
>;
