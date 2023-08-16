import { MatCheckboxModule } from '@angular/material/checkbox';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { MaterialStore } from '../../../material.store';
import { MaterialListComponent } from '../../material-list/material-list.component';
import {
  IMaterial,
  IMaterialEventFichier,
  IMaterialEventSelection,
  IMaterialEventSelectionFormGroup,
} from '../../../models';
import { MaterialCategoryComponent } from '../../material-list/material-category/material-category.component';
import { MaterialTypeComponent } from '../../material-list/material-type/material-type.component';
import { MaterialSubTypeComponent } from '../../material-list/material-sub-type/material-sub-type.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MaterialEventAddSelectionFormComponent } from './material-event-add-selection-form/material-event-add-selection-form.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable, tap } from 'rxjs';

/**
 * Component for adding materials to an event.
 */
@Component({
  selector: 'app-material-event-add-selection',
  templateUrl: './material-event-add-selection.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    MatButtonModule,
    MatCheckboxModule,
    MaterialListComponent,
    MaterialCategoryComponent,
    MaterialTypeComponent,
    MaterialSubTypeComponent,
    MaterialEventAddSelectionFormComponent,
  ],
})
export class MaterialEventAddSelectionComponent
  implements OnInit, AfterViewInit
{
  private materialStore = inject(MaterialStore);
  private changeDetector = inject(ChangeDetectorRef);

  @Input() eventId: number;
  @Input() materials: number;
  @Input() eventLabel: string;
  @Input() fileRequired: boolean;

  @ViewChildren(MaterialTypeComponent)
  private categoryComponents: QueryList<MaterialCategoryComponent>;

  /**
   * Observable that emits an array of selected materials.
   */
  public selectedMaterials$: Observable<IMaterial[]> =
    this.materialStore.selectedMaterials$.pipe(
      tap((materials) =>
        this.addEventForm.controls.materiels.setValue(
          materials.map(({ id }) => id)
        )
      )
    );

  /**
   * FormGroup for the add event form.
   */
  public addEventForm: FormGroup<IMaterialEventSelectionFormGroup>;

  public columns = ['select', 'numero_serie', 'marque', 'modele'];

  ngOnInit(): void {
    this.initAddEventForm();
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  /**
   * Initializes the add event form with form controls and validators.
   */
  private initAddEventForm(): void {
    this.addEventForm = new FormGroup<IMaterialEventSelectionFormGroup>({
      materiels: new FormControl<number[]>([], Validators.required),
      date: new FormControl<string>(null, Validators.required),
      materiel_evenement_type_id: new FormControl<number>(
        this.eventId,
        Validators.required
      ),
      materiel_evenement_fichiers: new FormControl<IMaterialEventFichier[]>(
        null
      ),
    });
    if (this.fileRequired) {
      this.addEventForm.controls.materiel_evenement_fichiers.addValidators(
        Validators.required
      );
    }
  }

  /**
   * Saves the event by extracting the form values, formatting the date, and adding the event selection to the material store.
   */
  public saveEvent(): void {
    const formValue = this.addEventForm?.getRawValue();
    const eventSelection: IMaterialEventSelection = {
      ...formValue,
      date: moment(formValue.date).format('YYYY-MM-DD'),
    };
    this.materialStore.addEventSelection(eventSelection);
  }

  /**
   * Toggles the selection of all checkboxes in the category components.
   * @param checked - The value to set for the checkboxes (true for selected, false for unselected).
   */
  public toggleAllCheckboxes(checked: boolean): void {
    this.categoryComponents.forEach((categoryComponent) =>
      categoryComponent.toggleAllCheckboxes(checked)
    );
  }

  /**
   * Checks if there is any material selected in any category component.
   * @returns True if there is at least one material selected, false otherwise.
   */
  public get hasSelection(): boolean {
    return this.categoryComponents?.some(
      (categoryComponent) => categoryComponent.hasSelection
    );
  }

  /**
   * Checks if all checkboxes in all category components are selected.
   * @returns True if all checkboxes are selected, false otherwise.
   */
  public get isAllSelected(): boolean {
    return (
      !!this.categoryComponents?.length &&
      this.categoryComponents.filter(
        (categoryComponent) => categoryComponent.isAllSelected
      ).length === this.categoryComponents.length
    );
  }
}
