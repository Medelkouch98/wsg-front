import { FormControl } from '@angular/forms';
import { IClient } from '@app/models';

export interface ISearchFormGroup {
  debut_periode: FormControl<string>;
  fin_periode: FormControl<string>;
  numero_dossier: FormControl<number>;
  numero_liasse_multi_pv: FormControl<number>;
  numero_liasse: FormControl<number>;
  numero_facture: FormControl<string>;
  nom_controleur: FormControl<string>;
  type_controle_id: FormControl<string>;
  categorie_id: FormControl<string>;
  immatriculation: FormControl<string>;
  numero_serie: FormControl<string>;
  marque: FormControl<string>;
  modele: FormControl<string>;
  energie_id: FormControl<string>;
  client_id: FormControl<number>;
  nom_client: FormControl<string>;
  nom_proprietaire: FormControl<string>;
  mode_reglement_id: FormControl<string>;
  client: FormControl<IClient>;
  proprietaire: FormControl<IClient>;
}
