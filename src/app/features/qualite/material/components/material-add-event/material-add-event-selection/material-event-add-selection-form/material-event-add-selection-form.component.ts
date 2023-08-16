import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, inject } from '@angular/core';
import {
  IMaterial,
  IMaterialEventSelectionFormGroup,
} from '../../../../models';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SubTypePipe } from '../../../../pipes';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialStore } from '../../../../material.store';
import {
  MarkRequiredFormControlAsDirtyDirective,
  FieldControlLabelDirective,
  FormControlErrorDirective,
} from '@app/directives';
import { UploadFilesComponent } from '@app/components';

@Component({
  selector: 'app-material-event-add-selection-form',
  templateUrl: './material-event-add-selection-form.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    TranslateModule,
    UploadFilesComponent,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MarkRequiredFormControlAsDirtyDirective,
    FieldControlLabelDirective,
    FormControlErrorDirective,
    SubTypePipe,
  ],
})
export class MaterialEventAddSelectionFormComponent implements OnDestroy {
  private materialStore = inject(MaterialStore);

  @Input() public eventLabel: string;
  @Input() public addEventForm: FormGroup<IMaterialEventSelectionFormGroup>;
  @Input() public selectedMaterials: IMaterial[];

  /**
   * Cleans up resources when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.materialStore.patchState({ selectedMaterials: [] });
  }
}
