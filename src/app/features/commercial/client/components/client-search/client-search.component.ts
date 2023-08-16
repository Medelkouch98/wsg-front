import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DirectionEnum, PermissionType } from '@app/enums';
import {
  IActionsButton,
  IClient,
  IStatisticCardData,
  PaginatedApiResponse,
} from '@app/models';
import { Observable, Subscription } from 'rxjs';
import { ClientStore } from '../../client.store';
import { IClientSearch } from '../../models';
import { ClientSearchFormComponent } from './client-search-form/client-search-form.component';
import { ClientSearchTableComponent } from './client-search-table/client-search-table.component';
import {
  ActionsButtonsComponent,
  StatisticCardComponent,
} from '@app/components';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    AsyncPipe,
    ActionsButtonsComponent,
    StatisticCardComponent,
    ClientSearchFormComponent,
    ClientSearchTableComponent,
  ],
  template: `
    <app-actions-buttons
      [actionButtons]="buttons"
      (action)="handleActions($event)"
    ></app-actions-buttons>
    <app-statistic-card
      [statisticsCardsData]="clientsStatistics$ | async"
    ></app-statistic-card>
    <app-client-search-form></app-client-search-form>
    <app-client-search-table></app-client-search-table>
  `,
})
export class ClientSearchComponent implements OnInit, OnDestroy {
  @ViewChild(ClientSearchFormComponent)
  private searchFormComponent: ClientSearchFormComponent;

  public clientsStatistics$: Observable<IStatisticCardData[]> =
    this.clientsStore.clientsStatistics$;

  public buttons: IActionsButton[] = [
    {
      libelle: 'client.ajouterClient',
      direction: DirectionEnum.RIGHT,
      action: 'addClient',
      permissions: [PermissionType.WRITE],
    },
  ];
  public subs: Subscription = new Subscription();

  constructor(
    private clientsStore: ClientStore,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.clientsStore.getClientsStatistics();
    // afficher le button exporter csv que lorsqu'on a des données
    this.subs.add(
      this.clientsStore.clients$.subscribe(
        (clients: PaginatedApiResponse<IClient>) => {
          const buttonExportCsvExist = this.buttons.some(
            (item: IActionsButton) => item.action === 'exportXls'
          );
          if (clients?.data?.length && !buttonExportCsvExist) {
            this.buttons = [
              ...this.buttons,
              {
                libelle: this.translateService.instant('commun.exportXls'),
                direction: DirectionEnum.LEFT,
                action: 'exportXls',
                icon: 'print',
                customColor: 'green',
                permissions: [PermissionType.EXPORT],
              },
            ];
          } else if (!clients?.data?.length) {
            this.buttons = this.buttons.filter(
              (item: IActionsButton) => item.action !== 'exportXls'
            );
          }
        }
      )
    );
  }

  /**
   * gestion des actions
   * @param action string
   */
  public handleActions(action: string): void {
    switch (action) {
      case 'exportXls':
        const searchForm: IClientSearch =
          this.searchFormComponent.searchForm.getRawValue();
        this.clientsStore.exportCsvClient(searchForm);
        break;
      case 'addClient':
        this.clientsStore.goToAddClient();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
