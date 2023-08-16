import { StatisticsModuleEnum } from '../enum/statistics-module.enum';
import { FormControl } from '@angular/forms';

export interface IStatisticsSearchFormGroup {
  date_debut: FormControl<string | Date>;
  date_fin: FormControl<string | Date>;
  module: FormControl<StatisticsModuleEnum>;
}
