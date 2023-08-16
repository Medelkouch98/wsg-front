import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MtxGridColumn,
  MtxGrid,
  MtxGridModule,
  MtxGridRowClassFormatter,
} from '@ng-matero/extensions/grid';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/store/app.state';
import { Subscription, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { PAGE_SIZE_OPTIONS } from '@app/config';
import { Sort } from '@angular/material/sort';
import { IDisplayOptions } from '../../../models';
import { Observable } from 'rxjs/internal/Observable';
import { ActivityStore } from '../../../activity.store';
import { PaginatedApiResponse } from '@app/models';
import {
  AsyncPipe,
  DatePipe,
  NgClass,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  TitleCasePipe,
} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MtxDialogModule } from '@ng-matero/extensions/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoDataSearchDirective } from '@app/directives';

@Component({
  selector: 'app-advanced-search-table',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    TranslateModule,
    DatePipe,
    MtxGridModule,
    MtxDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NoDataSearchDirective,
    TitleCasePipe,
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    NgClass,
  ],
  templateUrl: './advanced-search-table.component.html',
  styleUrls: ['./advanced-search-table.component.scss'],
})
export class AdvancedSearchTableComponent implements OnInit, OnDestroy {
  PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
  subscription: Subscription = new Subscription();

  activitySearchResponse$: Observable<
    PaginatedApiResponse<{ [key: string]: number | string }>
  > = this.activityStore.ActivitySearchResponseSelector$;
  page$: Observable<PageEvent> = this.activityStore.PageEvent$;
  sort$: Observable<Sort> = this.activityStore.Sort$;
  searchClicked$: Observable<boolean> =
    this.activityStore.advancedSearchClicked$;
  @ViewChild('grid') grid: MtxGrid;
  rowClassFormatter: MtxGridRowClassFormatter = {
    clientPro: (data) => data.type_client === 2,
  };
  columns: MtxGridColumn[] = [];

  constructor(
    private store: Store<AppState>,
    private activityStore: ActivityStore
  ) {}

  ngOnInit(): void {
    this.activityStore.GetDisplayOptions();
    this.subscription.add(
      this.activityStore.DisplayOptionsSelector$.pipe(
        map((displayOptions: IDisplayOptions[]) =>
          displayOptions.map((displayOption: IDisplayOptions) => {
            return {
              field: displayOption.bddname,
              header: displayOption.labelname,
              hide: displayOption.visible === 0,
              show: displayOption.visible === 1,
              width: this.getColumnMinWidth(displayOption.bddname),
              sortable: [
                'immatriculation',
                'date_saisie',
                'numero_rapport',
                'numero_liasse',
              ].includes(displayOption.bddname),
              disabled: displayOption.labelname.toLowerCase() === 'actions',
            } as MtxGridColumn;
          })
        ),
        map((columns: MtxGridColumn[]) => [
          // Ajouter une icone € en rouge si le contrôle est non réglé
          {
            field: 'is_paid',
            width: '0.3rem',
            class: 'pl-2 pr-0.5',
          },
          ...columns,
        ]),
        tap((columns: MtxGridColumn[]) => (this.columns = columns))
      ).subscribe()
    );
  }

  /**
   * ouverture du fiche technique
   * @param $event
   */
  goToFicheControle($event: {
    rowData: { [key: string]: number | string };
    index: number;
  }) {
    this.activityStore.GoToFicheControle($event.rowData.id as number);
  }

  /**
   * changer la page
   * @param $event
   */
  changePage($event: PageEvent) {
    this.activityStore.SetPageEvent($event);
    this.activityStore.ActivitySearch();
  }

  /**
   * changer le tri
   * @param $event
   */
  sortChange($event: Sort) {
    this.activityStore.SetSort($event);
    this.activityStore.ActivitySearch();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * fermer le menu des colonnes
   */
  closeMenu() {
    this.grid.columnMenu.menuTrigger.closeMenu();
  }

  /**
   * enregistrer la preference des colonnes, ordre, affichage ...
   */
  saveUserPreferences() {
    let displayOptions: IDisplayOptions[] = this.columns.map((column) => ({
      labelname: column.header.toString(),
      bddname: column.field,
      visible: column.show ? 1 : 0,
    }));
    this.activityStore.SaveDisplayOptions(displayOptions);
    this.closeMenu();
  }

  /**
   * Renvoie les classes de style CSS correspondantes en fonction du type de contrôle.
   *
   * @param {string} value - La valeur du type de contrôle.
   * @returns {string} - Une chaîne de classes de style CSS correspondantes.
   */
  getStylesForTypeControle(value: string): string {
    switch (value) {
      case 'CV':
        return 'bg-blue-100 text-blue-500';
      case 'VTP':
        return 'bg-cyan-100 text-cyan-600';
      case 'VTC':
        return 'bg-yellow-50 text-yellow-600';
      case 'CVC':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  /**
   * Renvoie la largeur correspondante en fonction de la colonne.
   *
   * @param {string} column - La colonne.
   * @returns {string} - width en rem.
   */
  getColumnMinWidth(column: string): string {
    switch (column) {
      case 'immatriculation':
        return '8rem';
      case 'nom_proprietaire':
      case 'nom_client':
      case 'controleur_nom':
        return '13rem';
      case 'categorie_code':
      case 'categorie_libelle':
      case 'type_contrôle':
      case 'action':
        return '4rem';
      default:
        return '5rem';
    }
  }
}
