import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { IControleur, IUser } from '@app/models';

export interface IUserControleurAttachFormGroup {
  attachRowsForm: FormArray<FormGroup<IUserControleurAttachRowForm>>;
}

export interface IUserControleurAttachRowForm {
  controleur: FormControl<IControleur>;
  user: FormControl<IUser>;
  login: FormControl<string>;
  email: FormControl<string>;
}

export interface IControleurRowFormValue {
  controleur: IControleur;
  user: IUser;
  login: string;
  email: string;
}
