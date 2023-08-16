import { FormControl } from '@angular/forms';

export interface IResetPasswordFormGroupModel {
  newPassword: FormControl<string>;
  newPasswordConfirmation: FormControl<string>;
}
