import { MatDateFormats } from '@angular/material/core';
import * as moment from 'moment';

export const FR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function extractTimeFromDate(date: Date): string {
  return moment(date).format('HH:mm');
}
