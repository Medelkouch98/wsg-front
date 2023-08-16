import { Component, Inject, Injector, Input, inject } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MAX_FILE_UPLOAD_SIZE } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { byteSizeToString } from './pipes';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    NgIf,
    NgFor,
    NgClass,
    TranslateModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UploadFilesComponent,
      multi: true,
    },
  ],
})
export class UploadFilesComponent implements ControlValueAccessor {
  private toastrService = inject(ToastrService);
  private translateService = inject(TranslateService);
  @Inject(Injector) private injector = inject(Injector);

  files: File[] = [];
  /**
   * @description indique si on veut gérer plusieurs fichiers ou non
   * @default true
   */

  @Input() multipleFiles: boolean = true;
  /**
   * @description indique la taille maximum de fichier en Bytes
   * @default MAX_FILE_UPLOAD_SIZE
   */

  @Input() maxFileUploadSize: number = MAX_FILE_UPLOAD_SIZE;
  /**
   * @description
   * indique les types de fichiers acceptés.
   * la vérification réelle des types de fichiers doit se faire dans le backend.
   * ici ce n'est qu'une suggestion au navigateur
   * @default *
   */
  @Input() acceptedTypes: string = '*';
  /**
   * @description
   * indique si on affiche le libelle 'pièce jointe'
   * @default true
   */
  @Input() showLabel: boolean = true;

  public ngControl: NgControl;

  onChange: (value: Blob[] | Blob) => void;
  onTouch: () => void;
  public required: boolean;

  /**
   * upload de fichier
   * @param event
   */
  onFileSelect(event: any): void {
    if (event.target.files?.length > 0) {
      const filesInput: File[] = [...event.target.files] ?? [];
      filesInput.forEach((file: File) => {
        //verifier si la taille du fichier dépasse la limite
        if (file.size > this.maxFileUploadSize) {
          this.toastrService.error(
            this.translateService.instant('error.fileSizeMustNotExceed', {
              value: byteSizeToString(this.maxFileUploadSize),
            })
          );
        }
      });
      if (!this.multipleFiles) {
        //si on est pas en mode multiple files, on vide la table d'abord
        this.files = [];
      }
      this.files.push(...filesInput);
      this.onChange(this.multipleFiles === true ? this.files : this.files[0]);
      this.onTouch();
    }
  }

  /**
   * suppression d'un fichier sélectionné
   * @param {number} index
   */
  deleteFile(index: number) {
    this.files.splice(index, 1); //on supprime le fichier de la liste en utilisant son index
    this.onChange(this.files);
    this.onTouch();
  }

  /**
   * registerOnTouched
   * @param fn
   */
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  /**
   * registerOnChange
   * @param fn
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * writeValue
   * @param {File[]} files
   */
  writeValue(files: File[] | File): void {
    this.ngControl = this.injector.get(NgControl);
    setTimeout(() => {
      this.required = this.ngControl.control?.hasValidator(Validators.required);
    });

    if (files) {
      this.files = files instanceof File ? [files] : [...files];
    }
  }
}
