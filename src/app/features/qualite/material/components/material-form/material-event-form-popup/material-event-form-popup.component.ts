import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UploadFilesComponent, DownloadFilesComponent } from '@app/components';
import { MaterialStore } from '../../../material.store';
import { Observable, Subscription, tap } from 'rxjs';
import { EventTypePipe } from '../../../pipes';
import {
  IMaterialSubTypeEventType,
  IMaterialEventFormGroup,
  IMaterialEvent,
  IMaterialEventFichier,
} from '../../../models';

@Component({
  selector: 'app-material-event-form-popup',
  templateUrl: './material-event-form-popup.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    EventTypePipe,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    UploadFilesComponent,
    DownloadFilesComponent,
    MaterialEventFormPopupComponent,
    MarkRequiredFormControlAsDirtyDirective,
    FormControlErrorDirective,
    FieldControlLabelDirective,
  ],
})
export class MaterialEventFormPopupComponent implements OnDestroy {
  public eventForm: FormGroup<IMaterialEventFormGroup>;
  public files: IMaterialEventFichier[];
  public subTypeEventTypes: IMaterialSubTypeEventType[];
  private openedEvent$: Observable<IMaterialEvent> =
    this.materialStore.openedEvent$;
  private eventFormSub: Subscription;

  /**
   * Creates an instance of MaterialEventFormPopupComponent.
   * @param data The injected data containing material event types and read-only flag.
   */
  constructor(
    private dialogRef: MatDialogRef<MaterialEventFormPopupComponent>,
    private materialStore: MaterialStore,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      materiel_evenement_types: IMaterialSubTypeEventType[];
      isReadOnly: boolean;
    }
  ) {
    this.eventFormSub = this.openedEvent$
      .pipe(
        tap((openedEvent) => {
          this.setEventTypesList(data.materiel_evenement_types, openedEvent);
          this.initEventForm(openedEvent);
          data.isReadOnly && this.eventForm.disable();
          this.files =
            this.eventForm?.getRawValue().materiel_evenement_fichiers;
          this.eventForm.controls.materiel_evenement_fichiers.reset();
        })
      )
      .subscribe();
  }

  /**
   * Sets the event types list based on the material event types and the opened event.
   * @param materiel_evenement_types The list of material event types.
   * @param openedEvent The opened event object.
   */
  private setEventTypesList(
    materiel_evenement_types: IMaterialSubTypeEventType[],
    openedEvent: IMaterialEvent
  ): void {
    const subTypeExists = materiel_evenement_types.some(
      ({ id }) => id === openedEvent?.materiel_evenement_type_id
    );

    if (!subTypeExists && openedEvent?.materiel_evenement_type_id) {
      const newEventType = {
        id: openedEvent.materiel_evenement_type_id,
      } as IMaterialSubTypeEventType;
      this.subTypeEventTypes = [...materiel_evenement_types, newEventType];
    } else {
      this.subTypeEventTypes = materiel_evenement_types;
    }
  }

  /**
   * Initializes the event form based on the provided event data.
   * @param event The event data.
   */
  private initEventForm(event: IMaterialEvent): void {
    this.eventForm = new FormGroup<IMaterialEventFormGroup>({
      materiel_evenement_type_id: new FormControl<number>(
        event?.materiel_evenement_type_id ?? null,
        Validators.required
      ),
      date: new FormControl<string>(event?.date ?? null, Validators.required),
      observation: new FormControl<string>(event?.observation ?? null),
      materiel_evenement_fichiers: new FormControl<IMaterialEventFichier[]>(
        event?.materiel_evenement_fichiers ?? null
      ),
      ...(event && { id: new FormControl<number>(event.id) }),
    });
  }

  /**
   * Gets an array of file names from the event files.
   * @returns An array of file names.
   */
  public get fileNames(): string[] {
    return this.files?.map(({ nom }: IMaterialEventFichier) => nom);
  }

  /**
   * Downloads the file at the specified index.
   * @param index The index of the file to download.
   */
  public downloadFile(index: number): void {
    const fileUrl = this.files.at(index).url;
    this.materialStore.downloadEventFile(fileUrl);
  }

  /**
   * Deletes the file at the specified index.
   * @param index The index of the file to delete.
   */
  public deleteFile(index: number): void {
    const fileId = this.files.at(index).id;
    const eventId = this.eventForm.getRawValue().id;
    this.materialStore.deleteEventFile({
      eventId,
      fileId,
      action: () => this.files.splice(index, 1),
    });
  }

  /**
   * Saves the event form data and closes the dialog.
   */
  public saveEvent(): void {
    const formValue: IMaterialEvent = this.eventForm.getRawValue();
    this.dialogRef.close(formValue);
  }

  /**
   * Cleans up resources when the component is destroyed.
   */
  public ngOnDestroy(): void {
    this.eventFormSub.unsubscribe();
  }
}
