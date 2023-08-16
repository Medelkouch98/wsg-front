import { IClient } from '@app/models';
import * as moment from 'moment/moment';

export interface IFacturationSearchForm {
  start_date: string;
  end_date: string;
  client: IClient;
}

export class FacturationSearchForm implements IFacturationSearchForm {
  start_date: string;
  end_date: string;
  client: IClient;

  constructor() {
    const today = new Date();
    this.start_date = moment(
      new Date(today.getFullYear(), today.getMonth(), 1)
    ).format('YYYY-MM-DD');
    this.end_date = moment(
      new Date(today.getFullYear(), today.getMonth() + 1, 0)
    ).format('YYYY-MM-DD');
    this.client = null;
  }
}
