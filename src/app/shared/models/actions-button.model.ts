import { DirectionEnum, PermissionType } from '@app/enums';
import { ThemePalette } from '@angular/material/core';

export interface IActionsButton {
  libelle: string;
  icon?: string;
  action: string;
  color?: ThemePalette;
  customColor?: string;
  direction: DirectionEnum;
  permissions?: PermissionType[];
  url?: string;
  display?: boolean;
  disabled?: boolean;
  tooltip?: string;
}
