import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PermissionType } from '@app/enums';
import { FormGroupValue } from '@app/types';

export interface IRoleFormGroup {
  id: FormControl<number>;
  modules: FormArray<FormGroup<IModuleFormGroup>>;
}

export interface IModuleFormGroup {
  id: FormControl<number>;
  nom: FormControl<string>;
  parent_id?: FormControl<number>;
  parentsIndexes?: FormControl<number[]>;
  childrenIndexes?: FormControl<number[]>;
  modules?: FormArray<FormGroup<IModuleFormGroup>>;
  permissions: FormControl<PermissionType[]>;
}

export type IRoleFormGroupValue = FormGroupValue<FormGroup<IRoleFormGroup>>;
export type IModuleFormGroupValue = FormGroupValue<FormGroup<IModuleFormGroup>>;
