import { FormControl } from '@angular/forms';

export interface IAuditSearchFormGroup {
  year: FormControl<number>;
  type_audit_id: FormControl<number>;
}

export class AuditSearchFormGroup implements IAuditSearchFormGroup {
  year: FormControl<number>;
  type_audit_id: FormControl<number>;
}
