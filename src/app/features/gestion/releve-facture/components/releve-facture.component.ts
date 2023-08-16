import { Component } from '@angular/core';
import { IActionsButton } from '@app/models';
import { ReleveFactureStore } from '../releve-facture.store';
import { ActionsButtonsComponent } from '@app/components';
import { ReleveFactureSearchFormComponent } from './releve-facture-search-form/releve-facture-search-form.component';
import { ReleveFactureSearchTableComponent } from './releve-facture-search-table/releve-facture-search-table.component';
import { DirectionEnum, PermissionType } from '@app/enums';
import { ReleveFactureService } from '../services/releve-facture.service';
import { Observable } from 'rxjs';
import { IReleveFactureExportRequestDetails } from '../models';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-releve-facture',
  standalone: true,
  imports: [
    ActionsButtonsComponent,
    ReleveFactureSearchFormComponent,
    ReleveFactureSearchTableComponent,
    AsyncPipe,
    NgIf,
  ],
  template: `
    <app-actions-buttons
      *ngIf="(selectedReleveFactures$ | async)?.length"
      [actionButtons]="buttons"
      (action)="handleAction($event)"
    ></app-actions-buttons>
    <app-releve-facture-search-form></app-releve-facture-search-form>
    <app-releve-facture-search-table></app-releve-facture-search-table>
  `,
  providers: [ReleveFactureStore, ReleveFactureService],
})
export class ReleveFactureComponent {
  public buttons: IActionsButton[] = [
    {
      libelle: 'gestion.releveFacture.editionReleve',
      direction: DirectionEnum.RIGHT,
      action: 'editionReleve',
      permissions: [PermissionType.WRITE],
    },
  ];
  selectedReleveFactures$: Observable<IReleveFactureExportRequestDetails[]> =
    this.releveFactureStore.selectedReleveFactures$;

  constructor(private releveFactureStore: ReleveFactureStore) {}

  /*
   * Gestion d'action(s) : Output de ActionButtons
   * */
  public handleAction($event: string): void {
    if ($event !== 'editionReleve') return;
    // ouverture de l'interface ajout de relevé de facture
    this.releveFactureStore.ExportReleveFactures();
  }
}
