import { FormControl } from '@angular/forms';

export interface IExportSapTuvRequestFormGroup {
  date_debut: FormControl<string>;
  date_fin: FormControl<string>;
}
