import { PermissionType, MenuTypeEnum } from '@app/enums';

export interface IModule {
  id?: number;
  parent_id: number;
  nom: string;
  url: string;
  type: MenuTypeEnum;
  icon?: string;
  modules?: IModule[];
  ordre: number;
  permissions?: PermissionType[];
  display_menu?: boolean;
}
