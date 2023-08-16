import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { IBandeauInformation } from '@app/models';
import { Store, select } from '@ngrx/store';
import { AppState } from 'app/core/store/app.state';
import { Observable, tap, timer } from 'rxjs';
import { GetBandeauInformations } from 'app/core/store/settings/settings.actions';
import { BandeauInformationsSelector } from 'app/core/store/settings/settings.selectors';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

const BAR_ANIMATION = 1000 * 8; // 8s;
const BAR_INFOS_REFRESH = 1000 * 60 * 60; // 1h;
const slideUpAnimation = trigger('slideUp', [
  transition('void => *', [
    style({ transform: 'translateY(100%)' }),
    animate(500),
  ]),
  transition('* => *', [
    style({ transform: 'translateY(100%)' }),
    animate(500, style({ transform: 'translateY(0%)' })),
  ]),
]);

@Component({
  selector: 'app-info-bar',
  standalone: true,
  templateUrl: './info-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, TranslateModule, MatIconModule],
  animations: [slideUpAnimation],
})
export class AppInfoBarComponent {
  private store = inject(Store<AppState>);

  public informations$: Observable<IBandeauInformation[]> = this.store.pipe(
    select(BandeauInformationsSelector)
  );
  public timer$ = timer(0, BAR_ANIMATION);
  public refreshInfos$: Observable<number> = timer(0, BAR_INFOS_REFRESH).pipe(
    tap(() => this.store.dispatch(GetBandeauInformations()))
  );
}
