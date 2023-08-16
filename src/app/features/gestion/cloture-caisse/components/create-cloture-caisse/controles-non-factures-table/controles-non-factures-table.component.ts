import { Component, Input } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import {
  IClotureCaisseInitialData,
  IControleNonFacture,
} from '../../../models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypePersonneEnum } from '@app/enums';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import { TranslateModule } from '@ngx-translate/core';
import { DECIMAL_NUMBER_PIPE_FORMAT, MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-controles-non-factures-table',
  standalone: true,
  imports: [
    MatTableModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './controles-non-factures-table.component.html',
})
export class ControlesNonFacturesTableComponent {
  @Input() typePersonne: TypePersonneEnum;

  TypePersonneEnum = TypePersonneEnum;
  clotureCaisseInitialData$: Observable<IClotureCaisseInitialData> =
    this.clotureCaisseStore.clotureCaisseInitialData$;
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;
  public columns = [
    'nom_client',
    'numero_rapport',
    'montant_ht',
    'montant_tva',
    'montant_ttc',
    'actions',
  ];
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  constructor(private clotureCaisseStore: ClotureCaisseStore) {}

  /**
   * récupérer les contrôles non facturés par type
   * @param {TypePersonneEnum} type
   * @return {Observable<IControleNonFacture[]>}
   */
  getControlesNonFacturesByType(
    type: TypePersonneEnum
  ): Observable<IControleNonFacture[]> {
    return this.clotureCaisseInitialData$.pipe(
      map((data: IClotureCaisseInitialData) => data.controles_non_factures),
      map((controles: IControleNonFacture[]) =>
        controles.filter(
          (controle: IControleNonFacture) => controle.type_client === type
        )
      )
    );
  }

  /**
   * ouvrir le contrôle correspondant à la facture
   * @param {IControleNonFacture} controleNonFacture
   */
  goToFicheControle(controleNonFacture: IControleNonFacture) {
    this.clotureCaisseStore.GoToFicheControle(controleNonFacture.controle_id);
  }
}
