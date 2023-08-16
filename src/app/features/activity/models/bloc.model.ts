import { PermissionType } from '@app/enums';

export interface IBloc {
  bloc: string;
  title: string;
  button?: IButtonBloc;
}

export interface IButtonBloc {
  label: string;
  action: string;
  show: boolean;
  permissions: PermissionType[];
}
