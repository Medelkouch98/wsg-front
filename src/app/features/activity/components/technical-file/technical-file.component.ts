import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TechnicalFileTypeEnum } from '@app/enums';
import { TechnicalFileStore } from './technical-file.store';
import { IActionsButton } from '@app/models';
import * as moment from 'moment';
import { IControlFiche } from '../../models';
import { Observable, Subscription } from 'rxjs';
import { TechnicalFileSummaryComponent } from './technical-file-summary/technical-file-summary.component';
import { TechnicalFileDocumentComponent } from './technical-file-document/technical-file-document.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActionsButtonsComponent } from '@app/components';

@Component({
  selector: 'app-technical-file',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    TranslateModule,
    TechnicalFileSummaryComponent,
    TechnicalFileDocumentComponent,
    MatCardModule,
    MatTabsModule,
    ActionsButtonsComponent,
  ],
  templateUrl: './technical-file.component.html',
  providers: [TechnicalFileStore],
})
export class TechnicalFileComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  technicalFileType = TechnicalFileTypeEnum;
  buttons$: Observable<IActionsButton[]> = this.technicalFileStore.buttons$;
  isFactured = false;
  numPv: number;
  subs: Subscription = new Subscription();
  selectedTabIndex$ = this.technicalFileStore.selectedTabIndex$;
  constructor(
    private technicalFileStore: TechnicalFileStore,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnInit(): void {
    this.technicalFileStore.GetControl();
    this.subs.add(
      this.technicalFileStore.control$.subscribe((control: IControlFiche) => {
        this.isFactured = !!(
          control?.facture_date_facture &&
          moment(control?.facture_date_facture).year() !== 1900
        );
        this.numPv = control?.numero_rapport;
      })
    );
  }

  /**
   * gestion des actions
   * @param action string
   */
  handleActions(action: string) {
    switch (action) {
      case TechnicalFileTypeEnum.DOCUMENT:
        this.technicalFileStore.DownloadPVAndAttestationPassage(this.numPv);
        break;
    }
  }

  /**
   * changements des tabs
   * @param index number
   */
  onSelectedIndexChange(index: number) {
    this.technicalFileStore.SetSelectedTabIndex(index);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
