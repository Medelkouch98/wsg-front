import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IStatisticCardData } from '@app/models';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statistic-card',
  standalone: true,
  imports: [
    NgClass,
    TranslateModule,
    MatCardModule,
    NgForOf,
    NgIf,
    MatIconModule,
  ],
  templateUrl: './statistic-card.component.html',
})
export class StatisticCardComponent {
  @Input() public statisticsCardsData: IStatisticCardData[];

  @Output() public cardClick: EventEmitter<number> = new EventEmitter<number>();

  onClick(row: IStatisticCardData) {
    this.cardClick?.emit(row?.id);
  }
}
