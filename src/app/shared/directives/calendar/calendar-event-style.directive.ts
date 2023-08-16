import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { WeekViewTimeEvent } from 'calendar-utils';
import { IDailyActivityEvent } from '../../../features/activity/models';

@Directive({
  selector: '[appCalendarEventStyle]',
})
export class CalendarEventStyleDirective implements OnInit {
  @Input() public event: WeekViewTimeEvent;

  @HostBinding('class') class: string;
  @HostListener('mouseover')
  onMouseOver() {
    //on augmente la hauteur onMouseOver si l'événement est court et non visible
    if (this._el.nativeElement.offsetHeight < 26) {
      this.class += ' eventMinHeight';
    }
  }
  @HostListener('mouseout')
  onMouseOut() {
    this.class = this.class.replace('eventMinHeight', '');
  }

  constructor(private _el: ElementRef) {}

  ngOnInit(): void {
    const dailyActivityEvent: IDailyActivityEvent = this.event.event.meta;
    this.class += ' custom-event';
    //on applique des classes css selon le type de controle, client et facture ...
    if (dailyActivityEvent) {
      if (dailyActivityEvent.code_type_controle) {
        this.class += ' ' + dailyActivityEvent.code_type_controle.trim();
      }
      if (dailyActivityEvent.code_client) {
        this.class += ' cltCompte ';
      }
      if (!dailyActivityEvent?.facture || dailyActivityEvent?.facture?.avoir) {
        this.class += ' nonFacture ';
      }
    }
  }
}
