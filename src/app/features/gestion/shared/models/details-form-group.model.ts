import { FormControl } from '@angular/forms';
import { IDetailPrestation } from '@app/models';
export interface IDetailsRowsForm {
  code_prestation: FormControl<string>;
  controle_id: FormControl<number>;
  immatriculation: FormControl<string>;
  libelle_prestation: FormControl<string>;
  montant_ht_brut: FormControl<number>;
  montant_ht_net: FormControl<number>;
  montant_ttc: FormControl<number>;
  montant_tva: FormControl<number>;
  numero_bon_livraison: FormControl<number>;
  prestation_id: FormControl<number>;
  proprietaire: FormControl<string>;
  prospect_id: FormControl<number>;
  remise_euro: FormControl<number>;
  remise_pourcentage: FormControl<number>;
  taux_tva: FormControl<number>;
  reotc: FormControl<IDetailPrestation>;
}
