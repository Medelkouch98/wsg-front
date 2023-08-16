import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  DirectionEnum,
  PermissionType,
  TechnicalFileTypeEnum,
} from '@app/enums';
import { TechnicalFileStore } from '../technical-file.store';
import { DisplayDataHeaderFile, ControlFiche } from '../../../models';
import { SanitizeResourceUrlPipe } from '@app/pipes';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-technical-file-document',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    TranslateModule,
    SanitizeResourceUrlPipe,
    MatCardModule,
  ],
  templateUrl: './technical-file-document.component.html',
})
export class TechnicalFileDocumentComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() fileType: TechnicalFileTypeEnum;
  @Input() withHeaderData: boolean = true;
  filePdf$: Observable<string>;
  displayedDataHeader = Object.keys(new DisplayDataHeaderFile());
  control$: Observable<ControlFiche> = this.technicalFileStore.control$;
  subs = new Subscription();

  constructor(private technicalFileStore: TechnicalFileStore) {}

  ngOnChanges() {
    this.filePdf$ = this.technicalFileStore.filePdfByFileType$(this.fileType);
  }

  ngOnInit(): void {
    this.technicalFileStore.GetPdf(this.fileType);
    if (this.fileType === TechnicalFileTypeEnum.PV) {
      this.technicalFileStore.SetButtons([
        {
          libelle: 'activityTechnicalFileLibelle.attestationPassage',
          direction: DirectionEnum.RIGHT,
          action: TechnicalFileTypeEnum.DOCUMENT,
          permissions: [PermissionType.READ],
        },
      ]);
    } else {
      this.technicalFileStore.SetButtons([]);
    }
  }

  /**
   * Récupération du message à afficher en fonction du type
   * de ficher
   * @return string
   */
  getMessage(): string {
    switch (this.fileType) {
      case TechnicalFileTypeEnum.PV:
        return 'activityTechnicalFileLibelle.emptyPv';
      case TechnicalFileTypeEnum.MESURES:
        return 'activityTechnicalFileLibelle.emptyMesures';
      case TechnicalFileTypeEnum.FACTURE:
        return 'activityTechnicalFileLibelle.emptyFacture';
      case TechnicalFileTypeEnum.JOURNALMODIF:
        return 'activityTechnicalFileLibelle.emptyJournal';
      case TechnicalFileTypeEnum.DOCUMENT:
        return 'activityTechnicalFileLibelle.emptyDocument';
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
