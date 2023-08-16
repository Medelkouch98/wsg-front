import { Moment } from 'moment';

export interface DownloadsInProgress {
  uuid: string;
  progress: number;
  date: Moment;
  name?: string;
  status?: 'F' | 'S';
}
