import { FormControl } from '@angular/forms';

export interface IUploadFilesFormGroup {
  files: FormControl<File[]>;
}
