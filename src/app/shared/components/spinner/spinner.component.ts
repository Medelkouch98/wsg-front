import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AppState } from '../../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import {
  LoadingHttpSettingsSelector,
  LoadingSettingsSelector,
} from '../../../core/store/settings/settings.selectors';
import { combineLatest, Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SpinnerComponent implements OnInit, OnDestroy {
  loadingSub: Subscription;
  isSpinnerVisible = true;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    combineLatest([
      this.store.pipe(select(LoadingHttpSettingsSelector)),
      this.store.pipe(select(LoadingSettingsSelector)),
    ]).subscribe(
      ([loadingHttp, loading]: [boolean, boolean]) =>
        (this.isSpinnerVisible = loadingHttp || loading)
    );
  }

  ngOnDestroy(): void {
    this.loadingSub?.unsubscribe();
  }
}
