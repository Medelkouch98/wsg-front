import { FormControl } from '@angular/forms';
import {
  FactureSearchForm,
  IFactureSearchForm,
} from './facture-search-form.model';
import { IApporteurAffaire, IClient } from '@app/models';
import { FactureStatusEnum, FactureTypeEnum } from '../../enums';

export interface IFactureSearchFormGroup {
  start_date: FormControl<string>;
  end_date: FormControl<string>;
  facture_type: FormControl<FactureTypeEnum>;
  montant_ttc: FormControl<number>;
  numero_facture: FormControl<string>;
  type_reglement: FormControl<number>;
  immatriculation: FormControl<string>;
  negocie_en: FormControl<number>;
  client_denomination: FormControl<string>;
  client_id: FormControl<number>;
  mandant: FormControl<string>;
  apporteurAffaire: FormControl<IApporteurAffaire>;
  client: FormControl<IClient>;
  facture_status: FormControl<FactureStatusEnum>;
}
export class FactureSearchFormGroup implements IFactureSearchFormGroup {
  start_date: FormControl<string>;
  end_date: FormControl<string>;
  facture_type: FormControl<FactureTypeEnum>;
  montant_ttc: FormControl<number>;
  numero_facture: FormControl<string>;
  type_reglement: FormControl<number>;
  immatriculation: FormControl<string>;
  negocie_en: FormControl<number>;
  client_denomination: FormControl<string>;
  client_id: FormControl<number>;
  mandant: FormControl<string>;
  apporteurAffaire: FormControl<IApporteurAffaire>;
  client: FormControl<IClient>;
  facture_status: FormControl<FactureStatusEnum>;

  constructor(invoiceSearchForm: IFactureSearchForm = new FactureSearchForm()) {
    this.start_date = new FormControl<string>(invoiceSearchForm.start_date);
    this.end_date = new FormControl<string>(invoiceSearchForm.start_date);
    this.facture_type = new FormControl<FactureTypeEnum>(
      invoiceSearchForm.facture_type
    );
    this.montant_ttc = new FormControl<number>(invoiceSearchForm.montant_ttc);
    this.numero_facture = new FormControl<string>(
      invoiceSearchForm.numero_facture
    );
    this.type_reglement = new FormControl<number>(
      invoiceSearchForm.type_reglement
    );
    this.immatriculation = new FormControl<string>(
      invoiceSearchForm.immatriculation
    );
    this.negocie_en = new FormControl<number>(invoiceSearchForm.negocie_en);
    this.client_denomination = new FormControl<string>(
      invoiceSearchForm.client_denomination
    );
    this.client_id = new FormControl<number>(invoiceSearchForm.client_id);
    this.mandant = new FormControl<string>(invoiceSearchForm.mandant);
    this.apporteurAffaire = new FormControl<IApporteurAffaire>(
      invoiceSearchForm.apporteurAffaire
    );
    this.client = new FormControl<IClient>(invoiceSearchForm.client);
    this.facture_status = new FormControl<FactureStatusEnum>(
      invoiceSearchForm.facture_status
    );
  }
}
