import { Component, inject } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import {
  BackgroundsSelector,
  LogoSettingsSelector,
  ThemeSettingsSelector,
} from '../../../core/store/settings/settings.selectors';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
const BACKGROUND_IMAGE_REFRESH = 15000; //15s

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, AsyncPipe, MatCardModule, RouterOutlet],
  templateUrl: './authentication.component.html',
})
export class AuthenticationComponent {
  public store: Store<AppState> = inject(Store<AppState>);
  public theme$ = this.store.pipe(select(ThemeSettingsSelector));
  public logo$ = this.store.pipe(select(LogoSettingsSelector));
  public currentBackground$ = this.store.pipe(
    select(BackgroundsSelector),
    mergeMap((backgrounds: string[]) => this.slideShow(backgrounds))
  );

  /**
   * Generates an Observable that represents a slideshow of backgrounds.
   * @param {string[]} backgrounds - An array of background image URLs.
   * @returns {Observable<string>} - An Observable that emits the current background URL.
   */
  private slideShow(backgrounds: string[]): Observable<string> {
    let index = 0;
    return timer(0, BACKGROUND_IMAGE_REFRESH).pipe(
      map(() => {
        const current = index++ % backgrounds.length;
        return `url(${backgrounds[current]})`;
      })
    );
  }
}
