import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IAverageDurationStatisticsResponse } from '../../../models';

@Component({
  selector: 'app-statistics-table',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, AsyncPipe, TranslateModule, MatTableModule],
  templateUrl: './average-duration-statistics-table.component.html',
})
export class AverageDurationStatisticsTableComponent {
  @Input() data: IAverageDurationStatisticsResponse[];
  public supColumns = [
    'supLabel',
    'under_21',
    'between_22_45',
    'between_46_60',
    'above_60',
  ];
  public columns = [
    'label',
    'under_21_count',
    'under_21_percentage',
    'under_21_average',
    'between_22_45_count',
    'between_22_45_percentage',
    'between_22_45_average',
    'between_46_60_count',
    'between_46_60_percentage',
    'between_46_60_average',
    'above_60_count',
    'above_60_percentage',
    'above_60_average',
  ];
}
