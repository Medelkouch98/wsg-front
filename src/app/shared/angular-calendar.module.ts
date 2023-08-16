import { NgModule } from '@angular/core';
import {
  CalendarCommonModule,
  CalendarDateFormatter,
  CalendarDayModule,
  CalendarModule,
  DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { CalendarEventStyleDirective } from '@app/directives';
import { CustomCalendarDateFormatter } from '@app/helpers';

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

@NgModule({
  imports: [
    CalendarDayModule,
    CalendarCommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: momentAdapterFactory,
    }),
  ],
  declarations: [CalendarEventStyleDirective],
  exports: [
    CalendarDayModule,
    CalendarCommonModule,
    CalendarModule,
    CalendarEventStyleDirective,
  ],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomCalendarDateFormatter,
    },
  ],
})
export class AngularCalendarModule {}
