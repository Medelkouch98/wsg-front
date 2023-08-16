import { Component, OnDestroy, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { TechnicalFileStore } from '../technical-file.store';
import {
  BlocControl,
  BlocVehicule,
  BlocCertificatImmat,
  BlocClient,
  IBloc,
  ControlFiche,
} from '../../../models';
import { PermissionType } from '@app/enums';
import { ActivityStore } from '../../../activity.store';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-technical-file-summary',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './technical-file-summary.component.html',
})
export class TechnicalFileSummaryComponent implements OnInit, OnDestroy {
  ficheBloc: IBloc[];
  controle: ControlFiche;
  isFactured = false;
  subs: Subscription = new Subscription();

  constructor(
    private technicalFileStore: TechnicalFileStore,
    private activityStore: ActivityStore
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.technicalFileStore.control$
        .pipe(
          tap((control: ControlFiche) => {
            this.controle = control;
            this.isFactured = !!(
              control?.facture_date_facture &&
              moment(control?.facture_date_facture).year() !== 1900
            );
            this.createFicheBlocs(control);
          })
        )
        .subscribe()
    );
    this.technicalFileStore.SetButtons([]);
  }

  /**
   * Créer les 4 blocs de la fiche resumer
   * @param control ControlFiche
   */
  createFicheBlocs(control: ControlFiche) {
    this.ficheBloc = [
      {
        bloc: 'client',
        title: 'Client',
        button: {
          label: 'Voir la facture',
          action: 'goToFacture',
          show: this.isFactured,
          permissions: [PermissionType.READ],
        },
      },
      {
        bloc: 'certificat',
        title: "Certificat d'immatriculation",
        button: {
          label: 'Fiche client',
          action: 'goToFicheClient',
          show: this.isFactured,
          permissions: [],
        },
      },
      {
        bloc: 'vehicule',
        title: 'Véhicule',
        button: {
          label: 'Historique des controles',
          action: 'goToHistoriqueControles',
          show: true,
          permissions: [PermissionType.READ],
        },
      },
      {
        bloc: 'controle',
        title: 'Contrôle',
        button: {
          label: 'Voir le PV',
          action: 'goToPv',
          show: true,
          permissions: [PermissionType.READ],
        },
      },
    ];
  }

  /**
   * Récupérer les clé à afficher pour chaque bloc
   * de la fiche résumer
   * @param key string
   * @return string[]
   */
  getBlocKeys(key: string): string[] {
    switch (key) {
      case 'controle':
        return Object.keys(new BlocControl());
      case 'vehicule':
        return Object.keys(new BlocVehicule());
      case 'certificat':
        return Object.keys(new BlocCertificatImmat());
      case 'client':
        return Object.keys(new BlocClient());
    }
  }

  /**
   * gérer les actions des boutons
   * @param action string
   */
  handleAction(action: string): void {
    switch (action) {
      case 'goToFicheClient':
        this.technicalFileStore.GoToClient(this.controle.client_id);
        break;
      case 'goToPv':
        this.technicalFileStore.SetSelectedTabIndex(1);
        break;
      case 'goToFacture':
        this.technicalFileStore.SetSelectedTabIndex(3);
        break;
      case 'goToHistoriqueControles':
        this.technicalFileStore.GoToAdvancedSearch();
        this.activityStore.SetFormAndSearchByImmat(
          this.controle.immatriculation
        );
        break;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
