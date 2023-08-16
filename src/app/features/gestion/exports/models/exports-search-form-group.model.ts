import { FormControl } from '@angular/forms';
import { ExportTypeEnum } from '@app/enums';
import { IClient } from '@app/models';
import { ExportEtatEnum } from '../enums/export-etat.enum';

export interface IExportsSearchFormGroup {
  date_debut: FormControl<string>;
  date_fin: FormControl<string>;
  type_etat: FormControl<ExportEtatEnum>;
  file_type: FormControl<ExportTypeEnum>;
  client?: FormControl<IClient>;
  numero_facture?: FormControl<string>;
  libelle_prestation?: FormControl<string>;
  code_partenaire?: FormControl<string>;
  nom_partenaire?: FormControl<string>;
  numero_rapport?: FormControl<string>;
  numero_mandat?: FormControl<string>;
  nom_mandat?: FormControl<string>;
  numero_caisse?: FormControl<string>;
  type_controle_id?: FormControl<number>;
  categorie_id?: FormControl<number>;
  search_by?: FormControl<number>;
  kilometrage?: FormControl<number>;
}
