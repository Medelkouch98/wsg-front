import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subscription, timer } from 'rxjs';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { select, Store } from '@ngrx/store';
import {
  IDailyActivityCalendarResponse,
  IDailyActivityEvent,
} from '../../models';
import { AppState } from '../../../../core/store/app.state';
import {
  StartLoadingAction,
  StopLoadingAction,
} from '../../../../core/store/settings/settings.actions';
import * as moment from 'moment';
import { SettingsLanguageSelector } from '../../../../core/store/settings/settings.selectors';
import { ICentre, IStatisticCardData } from '@app/models';
import { UserCurrentCentreSelector } from '../../../../core/store/auth/auth.selectors';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { extractTimeFromDate } from '@app/helpers';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CALENDAR_AGENDA_SIZE_CONFIG } from '@app/config';
import { ActivityStore } from '../../activity.store';
import { StatisticCardComponent } from '@app/components';
import { AngularCalendarModule } from '../../../../shared/angular-calendar.module';
import { AsyncPipe, DatePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

const DAILY_ACTIVITY_TIMER = 1000 * 36; // 36s;
//le delai de refresh du calendar si non null
const DAILY_ACTIVITY_REFRESH_INTERVAL = 1000 * 60; // 1min

@Component({
  selector: 'app-daily-activity',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    TranslateModule,
    SlicePipe,
    DatePipe,
    FormsModule,
    StatisticCardComponent,
    AngularCalendarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './daily-activity.component.html',
  styleUrls: [
    './daily-activity.component.scss',
    '../../../../../assets/styles/agenda.scss',
  ],
})
export class DailyActivityComponent implements OnInit, OnDestroy {
  view = CalendarView.Day;
  viewDate: Date = new Date();
  dailyActivityResponse$: Observable<IDailyActivityCalendarResponse[]> =
    this.activityStore.DailyActivityCalendarSelector$;
  dailyActivityViewDate$: Observable<string> =
    this.activityStore.DailyActivityViewDateSelector$;
  language$: Observable<string> = this.store.pipe(
    select(SettingsLanguageSelector)
  );
  public numero_affaire: number;
  public currentCentre$: Observable<ICentre> = this.store.pipe(
    select(UserCurrentCentreSelector)
  );
  animationInProgress: boolean = false;
  //index debut/fin et nombre des elements de l'agenda à afficher
  tabIndexStart: number = 0;
  tabIndexEnd: number;
  tabSize: number;
  //permet de savoir le type d'ecran pour savoir le nombre d'element à afficher
  currentBreakpoint: string;
  activityStatistics$: Observable<IStatisticCardData[]> =
    this.activityStore.ActivityStatistic$;
  private subscription = new Subscription();
  interval$ = timer(DAILY_ACTIVITY_TIMER, DAILY_ACTIVITY_REFRESH_INTERVAL);

  constructor(
    private store: Store<AppState>,
    private breakpointObserver: BreakpointObserver,
    private translateService: TranslateService,
    private activityStore: ActivityStore
  ) {}

  ngOnInit(): void {
    this.setupTabSize();
    this.subscription.add(
      combineLatest([
        this.currentCentre$,
        this.dailyActivityViewDate$,
      ]).subscribe(([currentCentre, viewDate]: [ICentre, string]) => {
        this.numero_affaire = currentCentre?.numero_affaire;
        this.viewDate = moment(viewDate, 'YYYY-MM-DD').toDate();
        this.activityStore.GetActivityCalendar();
      })
    );
    this.subscription.add(
      this.interval$.subscribe(() => this.activityStore.GetActivityCalendar())
    );
  }

  /**
   * permet de modifier la valeur du tab-size selon le breakpoint
   */
  setupTabSize(): void {
    this.subscription.add(
      this.breakpointObserver
        .observe([...CALENDAR_AGENDA_SIZE_CONFIG.keys()])
        .subscribe(() => {
          const newBreakpoint = [...CALENDAR_AGENDA_SIZE_CONFIG.keys()].find(
            (breakpoint) => this.breakpointObserver.isMatched(breakpoint)
          );
          this.tabSize = CALENDAR_AGENDA_SIZE_CONFIG.get(newBreakpoint);
          //si on change la taille d'ecran on veut garder les elements afficher mais reduire our augmenter le nombre d'elements
          if (newBreakpoint !== this.currentBreakpoint) {
            this.tabIndexEnd = this.tabIndexStart + this.tabSize;
          }
          this.currentBreakpoint = newBreakpoint;
        })
    );
  }

  /**
   * permet de gérer lorsqu'on clique sur un element d'agenda (controle)
   * @param calendarEvent : CalendarEvent<IDailyActivityEvent> l'element d'agenda (controle)
   */
  goToFicheControle(calendarEvent: CalendarEvent<IDailyActivityEvent>): void {
    this.activityStore.GoToFicheControle(calendarEvent.meta.controle_id);
  }

  /**
   * afficher le spinner au debut de l'animation du mat-tab
   */
  animationStart() {
    this.store.dispatch(StartLoadingAction());
    this.animationInProgress = true;
  }

  /**
   * cacher le spinner à la fin de l'animation du mat-tab
   */
  animationDone() {
    this.animationInProgress = false;
    this.store.dispatch(StopLoadingAction());
  }

  /**
   * modifie les extrémités start et end pour l'affichage des agendas
   */
  moveLeft() {
    if (this.tabIndexStart > 0) {
      this.tabIndexStart--;
      this.tabIndexEnd--;
    }
  }

  /**
   * modifie les extrémités start et end pour l'affichage des agendas
   * @param total : number le nombre d'agendas (max)
   */
  moveRight(total: number) {
    if (this.tabIndexEnd < total) {
      this.tabIndexStart++;
      this.tabIndexEnd++;
    }
  }

  /**
   * permet de fair le mapping des elements IItem à CalendarEvent pour pouvoir les afficher
   *
   * @param dailyActivityEvents : IDailyActivityEvent[] element de l'agenda (contrôle)
   */
  mapToEvent(
    dailyActivityEvents: IDailyActivityEvent[]
  ): CalendarEvent<IDailyActivityEvent>[] {
    return dailyActivityEvents.map(
      (dailyActivityEvent: IDailyActivityEvent) => {
        return {
          id: dailyActivityEvent.controle_id,
          start: new Date(dailyActivityEvent.date_debut),
          end: new Date(dailyActivityEvent.date_fin),
          title: this.getTooltipMessage(dailyActivityEvent),
          meta: dailyActivityEvent,
        };
      }
    );
  }

  /**
   * retourne le titre du contrôle à afficher dans l'agenda
   *
   * @param dailyActivityEvent : IDailyActivityEvent element de l'agenda (contrôle)
   * returns string
   */
  public getTitle(dailyActivityEvent: IDailyActivityEvent): string {
    return `${dailyActivityEvent.code_type_controle} / ${dailyActivityEvent.nom_client} `;
  }

  public getTitleTime(dailyActivityEvent: IDailyActivityEvent): string {
    const heureDebut = extractTimeFromDate(
      new Date(dailyActivityEvent.date_debut)
    );
    const heureFin = extractTimeFromDate(new Date(dailyActivityEvent.date_fin));
    const duration = moment(dailyActivityEvent.date_fin).diff(
      dailyActivityEvent.date_debut,
      'minutes'
    );
    return `${heureDebut} - ${heureFin} - ${duration} min`;
  }

  /**
   * retourne le message tooltip du contrôle à afficher dans l'agenda
   *
   * @param dailyActivityEvent : IDailyActivityEvent element de l'agenda (contrôle)
   * returns string
   */
  public getTooltipMessage(dailyActivityEvent: IDailyActivityEvent): string {
    const heureDebut = extractTimeFromDate(
      new Date(dailyActivityEvent.date_debut)
    );
    const heureFin = extractTimeFromDate(new Date(dailyActivityEvent.date_fin));
    const duration = moment(dailyActivityEvent.date_fin).diff(
      dailyActivityEvent.date_debut,
      'minutes'
    );

    let tooltipMessage =
      `${heureDebut} - ${heureFin} - ${duration} min` +
      '\n' +
      `${dailyActivityEvent.code_type_controle} / ${dailyActivityEvent.nom_client}` +
      '\n';
    if (dailyActivityEvent.email || dailyActivityEvent.telephone) {
      tooltipMessage += dailyActivityEvent.email
        ? `${dailyActivityEvent.email} / `
        : ``;
      tooltipMessage += dailyActivityEvent.telephone
        ? dailyActivityEvent.telephone
        : ``;
    }
    tooltipMessage += `${dailyActivityEvent.marque_ci} / ${dailyActivityEvent.immatriculation}\n`;

    if (dailyActivityEvent.facture && dailyActivityEvent.facture.montant_ttc) {
      tooltipMessage += `${parseFloat(
        dailyActivityEvent.facture.montant_ttc
      ).toFixed(2)} / `;
      tooltipMessage += this.translateService.instant(
        dailyActivityEvent.facture.montant_ttc -
          dailyActivityEvent.facture.montant_regle >
          0
          ? 'commun.unpaid'
          : 'commun.paid'
      );
    } else {
      tooltipMessage += this.translateService.instant('commun.unbilled');
    }
    return tooltipMessage;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*
   * changement de la date
   * */
  dateInput() {
    this.activityStore.SetDailyActivityViewDate(
      moment(this.viewDate).format('YYYY-MM-DD')
    );
  }
}
