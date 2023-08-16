import { FormControl } from '@angular/forms';
import { IPrestationAgendaFormDetails } from './prestation-agenda-form-details.model';

export interface IPrestationAgendaFormGroup {
  bo_name: FormControl<string>;
  fo_name: FormControl<string>;
  fo_description: FormControl<string>;
  bo_description: FormControl<string>;
  color: FormControl<string>;
  price: FormControl<string>;
  display_price: FormControl<string>; //To do: should boolean on backend
  display_duration: FormControl<string>; //To do: should boolean on backend
  enabled: FormControl<string>; //To do: should boolean on backend
  visible: FormControl<string>; //To do: should boolean on backend
  assurance_web: FormControl<string>; //To do: should boolean on backend
  duration: FormControl<number>;
  agendas: FormControl<IPrestationAgendaFormDetails[]>;
  categories: FormControl<IPrestationAgendaFormDetails[]>;
}
