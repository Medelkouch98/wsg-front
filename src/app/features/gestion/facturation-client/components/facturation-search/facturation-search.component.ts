import { Component, OnDestroy, OnInit } from '@angular/core';
import { FacturationSearchFormComponent } from './facturation-search-form/facturation-search-form.component';
import { FacturationSearchTableComponent } from './facturation-search-table/facturation-search-table.component';
import { ActionsButtonsComponent } from '@app/components';
import { DirectionEnum, PermissionType } from '@app/enums';
import { IActionsButton } from '@app/models';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CustomDateMaskDirective } from '@app/directives';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControlErrorPipe } from '@app/pipes';
import { FacturationClientStore } from '../../facturation-client.store';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { GenerateFacturePopupComponent } from '../generate-facture-popup/generate-facture-popup.component';

@Component({
  selector: 'app-facturation-search',
  standalone: true,
  imports: [
    FacturationSearchFormComponent,
    FacturationSearchTableComponent,
    ActionsButtonsComponent,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
    CustomDateMaskDirective,
    FormControlErrorPipe,
    ReactiveFormsModule,
    AsyncPipe,
    NgIf,
    GenerateFacturePopupComponent,
  ],
  template: `
    <ng-container
      *ngIf="{
        hasDatePlusDeDeuxMois: hasOldUnbilledControls$ | async
      } as _"
    >
      <app-actions-buttons
        [actionButtons]="buttons"
        (action)="handleActions($event)"
      ></app-actions-buttons>
      <app-facturation-search-form></app-facturation-search-form>
      <div
        class="m-2 bg-warn p-3 text-center font-medium text-white"
        *ngIf="!!_.hasDatePlusDeDeuxMois"
      >
        Attention Il existe des prestations datant de plus 2 mois non facturées.
      </div>
      <app-facturation-search-table></app-facturation-search-table>
    </ng-container>
  `,
})
export class FacturationSearchComponent implements OnInit, OnDestroy {
  public hasOldUnbilledControls$: Observable<boolean> =
    this.facturationClientProStore.hasOldUnbilledControls$;

  public buttons: IActionsButton[] = [
    {
      libelle: 'gestion.factures.createFactDiverse',
      direction: DirectionEnum.RIGHT,
      action: 'goToFacturationDiverse',
      permissions: [PermissionType.WRITE],
    },
  ];
  public subs: Subscription = new Subscription();

  constructor(
    private facturationClientProStore: FacturationClientStore,
    private router: Router
  ) {}

  ngOnInit() {
    // Lancer la recherche
    this.facturationClientProStore.searchControles();
  }

  /**
   * gestion des actions
   * @param {string} action
   */
  public handleActions(action: string) {
    switch (action) {
      case 'goToFacturationDiverse':
        this.router.navigate(['p/gestion/facturation/diverse']);
        break;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
