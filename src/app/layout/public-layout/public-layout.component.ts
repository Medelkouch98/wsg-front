import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ThemeSettingsSelector } from '../../core/store/settings/settings.selectors';
import { AppState } from '../../core/store/app.state';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  template: `
    <div [class]="theme$ | async" class="h-full w-full">
      <router-outlet />
    </div>
  `,
})
export class PublicLayoutComponent implements OnInit {
  theme$: Observable<string>;

  constructor(public store: Store<AppState>) {}

  ngOnInit(): void {
    this.theme$ = this.store.pipe(select(ThemeSettingsSelector));
  }
}
