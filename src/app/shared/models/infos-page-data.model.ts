import { InfosPageType } from '@app/enums';

export interface InfosPageData {
  infoPageType: InfosPageType;
  icon?: string;
  iconClass?: string;
  image?: string;
  title?: string;
  subTitle?: string;
}

export class InfosPageDataClass implements InfosPageData {
  infoPageType: InfosPageType;
  icon?: string;
  iconClass?: string;
  image?: string;
  title?: string;
  subTitle?: string;

  constructor() {
    this.infoPageType = null;
    this.iconClass = null;
    this.icon = null;
    this.image = null;
    this.subTitle = null;
    this.title = null;
  }
}
