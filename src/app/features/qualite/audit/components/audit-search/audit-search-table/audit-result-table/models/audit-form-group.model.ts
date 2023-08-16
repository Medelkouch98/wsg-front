import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAuditAnomalie, IAuditAnomalieFile } from '../../../../../models';

export interface IAuditFormGroup {
  auditRowsForm: FormArray<FormGroup<IAuditRowForm>>;
}

export interface IAuditRowForm {
  id: FormControl<number>;
  date_reponse_centre: FormControl<string>;
  action: FormControl<string>;
  anomalie: FormControl<string>;
  justification: FormControl<string>;
  commentaire: FormControl<string>;
  commentaire_reseau: FormControl<string>;
  fichiers: FormControl<IAuditAnomalieFile[]>;
  gravite: FormControl<string>;
  traite: FormControl<boolean>;
}
export class AuditRowForm {
  id: FormControl<number>;
  date_reponse_centre: FormControl<string>;
  action: FormControl<string>;
  anomalie: FormControl<string>;
  justification: FormControl<string>;
  commentaire: FormControl<string>;
  commentaire_reseau: FormControl<string>;
  fichiers: FormControl<IAuditAnomalieFile[]>;
  gravite: FormControl<string>;
  traite: FormControl<boolean>;

  constructor(anomaly: IAuditAnomalie, isReadOnly: boolean) {
    this.id = new FormControl<number>(anomaly.id);
    this.date_reponse_centre = new FormControl<string>(
      { value: anomaly.date_reponse_centre, disabled: isReadOnly },
      Validators.required
    );
    this.action = new FormControl<string>(
      { value: anomaly.action, disabled: isReadOnly },
      Validators.required
    );
    this.anomalie = new FormControl<string>({
      value: anomaly.anomalie,
      disabled: true,
    });
    this.justification = new FormControl<string>({
      value: anomaly.justification,
      disabled: true,
    });
    this.commentaire = new FormControl<string>({
      value: anomaly.commentaire,
      disabled: true,
    });
    this.commentaire_reseau = new FormControl<string>({
      value: anomaly.commentaire_reseau,
      disabled: true,
    });
    this.fichiers = new FormControl<IAuditAnomalieFile[]>(anomaly.fichiers);
    this.gravite = new FormControl<string>(anomaly.gravite);
    this.traite = new FormControl<boolean>(anomaly.traite);
  }
}
