import { FormControl } from '@angular/forms';

export interface IFacturationFormGroup {
  echeance_id: FormControl<number>;
  mode_reglement_id: FormControl<number>;
  remise_pourcentage: FormControl<number>;
  facture_multipv_unitaire: FormControl<boolean>;
  bon_commande_obligatoire: FormControl<boolean>;
  mode_bon_livraison: FormControl<number>;
  compte_comptable: FormControl<string>;
  facture_releve: FormControl<boolean>;
  tva_intracommunautaire: FormControl<string>;
}
