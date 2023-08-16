import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { DownloadsInProgress } from '@app/models';
import { ExportEtatsService } from '@app/services';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import * as webSocketSelector from '../../../core/store/websocket/websocket.selectors';

@Component({
  selector: 'app-download-progress',
  standalone: true,
  imports: [
    MatExpansionModule,
    AsyncPipe,
    TranslateModule,
    MatIconModule,
    NgIf,
    MatProgressSpinnerModule,
    NgForOf,
    NgScrollbarModule,
  ],
  templateUrl: './download-progress.component.html',
  styleUrls: ['./download-progress.component.scss'],
})
export class DownloadProgressComponent {

  public downloadsInProgress$: Observable<DownloadsInProgress[]> =
    this.store.pipe(select(webSocketSelector.EtatsDownloadsSelector));

  constructor(
    private fileService: ExportEtatsService,
    private store: Store<AppState>
  ) {}
}
