import { MenuTypeEnum } from '@app/enums';

export interface SubChildren {
  id: number;
  state: string;
  route: string;
  name: string;
  type?: string;
}

export interface ChildrenItems {
  id: number;
  state: string;
  route: string;
  name: string;
  type?: string;
  subchildren?: SubChildren[];
}

export interface Menu {
  id: number;
  state: string;
  route: string;
  name: string;
  type: MenuTypeEnum;
  icon?: string;
  children?: ChildrenItems[];
}
