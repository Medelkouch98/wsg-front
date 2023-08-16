import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CompteurAddActionRequest,
  IAttachment,
  ICompteursAddFormGroup,
  ICompteursAddJustificationDialogData,
  IJustificationsResponse,
  IJustifieForAllRequest,
  TypeCompteurAction,
} from '../../models';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { map } from 'rxjs/operators';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../core/store/app.state';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  OptionalDropdownComponent,
  UploadFilesComponent,
} from '@app/components';
import {
  IOptionalDropDownDetails,
  OptionalDropDownDetails,
} from '../../../../../shared/components/optional-dropdown/models';
import { ByteSizePipe } from '../../../../../shared/components/upload-file/pipes';
import { CompteursHelper } from '../../helpers/compteurs.helper';
import { DownloadFilesComponent } from '../../../../../shared/components/download-files/download-files.component';
import { CompteursStore } from '../../compteurs.store';
import { CompteursService } from '../../services/compteurs.service';

@Component({
  selector: 'app-compteurs-dialog',
  standalone: true,
  templateUrl: './compteurs-dialog.component.html',
  imports: [
    AsyncPipe,
    TranslateModule,
    UpperCasePipe,
    NgIf,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    AsyncPipe,
    ReactiveFormsModule,
    OptionalDropdownComponent,
    UploadFilesComponent,
    ByteSizePipe,
    DownloadFilesComponent,
  ],
  providers: [CompteursStore, CompteursService],
})
export class CompteursDialogComponent implements OnInit, OnDestroy {
  //On fait un map vers OptionalDropDownDetails pour pouvoir passer les données au composant OptionalDropdownComponent
  actionsPreventives$: Observable<IOptionalDropDownDetails[]> =
    this.data.justifications$.pipe(
      map((justificationsResponses: IJustificationsResponse[]) =>
        this.compteursHelper.getActionAsOptionalDropDownDetails(
          justificationsResponses,
          TypeCompteurAction.PREVENTIVE,
          this.form.controls.justification?.value?.id
        )
      )
    );
  actionsCorrectives$: Observable<IOptionalDropDownDetails[]> =
    this.data.justifications$.pipe(
      map((justificationsResponses: IJustificationsResponse[]) =>
        this.compteursHelper.getActionAsOptionalDropDownDetails(
          justificationsResponses,
          TypeCompteurAction.CORRECTIVE,
          this.form.controls.justification?.value?.id
        )
      )
    );
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  compteurJustifications$: Observable<IOptionalDropDownDetails[]> =
    this.data.justifications$.pipe(
      map((justificationsResponses: IJustificationsResponse[]) =>
        justificationsResponses.map(
          (e) => new OptionalDropDownDetails(e.id, e.libelle)
        )
      )
    );
  subTitle = 'qualite.compteurs.ajouterUnDescriptif';
  form: FormGroup<ICompteursAddFormGroup>;

  subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private compteursHelper: CompteursHelper,
    private compteursStore: CompteursStore,
    private dialogRef: MatDialogRef<CompteursDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ICompteursAddJustificationDialogData
  ) {}

  ngOnInit(): void {
    this.createForm();
    if (this.data.compteur) {
      this.form.setValue({
        justification: {
          id: this.data.compteur?.justification_id,
          libelle: this.data.compteur?.justification,
        },
        actions: {
          action_corrective: this.getActionValue(TypeCompteurAction.CORRECTIVE),
          action_preventive: this.getActionValue(TypeCompteurAction.PREVENTIVE),
        },
        fichiers: [],
      });
    }
  }

  /**
   * Output du composant OptionalDropdownComponent de justifications
   * @param {IOptionalDropDownDetails} value
   */
  justificationChange(value: IOptionalDropDownDetails) {
    //si on change de justification, on doit réinitialiser le formulaire d'actions
    this.form.controls.actions?.reset();
  }

  /**
   * creation du formulaire d'ajout d'action
   * @private
   */
  private createForm(): void {
    this.form = this.fb.group<ICompteursAddFormGroup>({
      justification: new FormControl(null, Validators.required),
      actions: this.fb.group({
        action_corrective: new FormControl(null, Validators.required),
        action_preventive: new FormControl(null, Validators.required),
      }),
      fichiers: new FormControl([]),
    });
  }

  /**
   *  recuperer l'action selon le type
   * @param {TypeCompteurAction} type
   * @return {IOptionalDropDownDetails}
   */
  getActionValue(type: TypeCompteurAction): IOptionalDropDownDetails {
    const action = this.data?.compteur?.actions?.find(
      (a) => a.type_action === type
    );
    return action
      ? new OptionalDropDownDetails(action?.id, action?.libelle)
      : null;
  }

  /**
   * Envoie des données au composant parent pour l'enregistrement
   */
  handleSave(): void {
    const formValue = this.form.getRawValue();

    //on regroupe les données provenant des formulaires justification, actions et document
    const compteurDetailsForm: IJustifieForAllRequest = {
      justification_id: formValue.justification?.id,
      justification_libelle: formValue.justification?.libelle,
      actions: [
        new CompteurAddActionRequest(
          formValue.actions.action_corrective?.id,
          formValue.actions.action_corrective?.libelle,
          formValue.actions.action_preventive?.id,
          formValue.actions.action_preventive?.libelle
        ),
      ],
      fichiers: formValue.fichiers,
    };
    this.dialogRef.close(compteurDetailsForm);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * on recupere els noms des fichiers, cette liste sera envoyée comme input pour le composant de telechargement
   * @param {IAttachment[]} attachments
   * @return {string[]}
   */
  fileNamesFromAttachments(attachments: IAttachment[]): string[] {
    return attachments?.map((attachment: IAttachment) => attachment.fichier);
  }

  /**
   * téléchargement d'un fichier sélectionné
   * @param {IAttachment} attachment
   */
  downloadAttachment = (attachment: IAttachment): void => {
    this.compteursStore.DownloadAttachment(attachment);
  };

  /**
   * suppression d'un fichier sélectionné
   * @param {number} fichierId
   */
  deleteAttachment = (fichierId: number): void => {
    this.compteursStore.DeleteAttachment(fichierId);
    this.data.compteur.fichiers = this.data.compteur.fichiers.filter(
      (f) => f.id !== fichierId
    );
  };
}
