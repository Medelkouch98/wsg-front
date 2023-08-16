import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { IClotureCaisseRecapitulatif, IEcart } from '../../../models';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';
import { ClotureCaisseStore } from '../../../cloture-caisse.store';
import { Observable, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalNumberDirective } from '../../../../../../shared/directives/decimal-number.directive';
import { FormControlErrorPipe } from '@app/pipes';
import { FieldControlLabelDirective } from '@app/directives';
import {
  mapTypeComptageEnumReglementCode,
  TypeComptageEnum,
} from '../../../enums';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/store/app.state';
import { ModesReglementsSelector } from '../../../../../../core/store/resources/resources.selector';
import { IModeReglement } from '@app/models';

@Component({
  selector: 'app-recapitulatif-des-comptages',
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgIf,
    AsyncPipe,
    FieldControlLabelDirective,
    MatInputModule,
    ReactiveFormsModule,
    DecimalNumberDirective,
    TranslateModule,
    FormControlErrorPipe,
    MatButtonModule,
    MatTableModule,
    DecimalPipe,
    MatIconModule,
    MatExpansionModule,
  ],
  templateUrl: './recapitulatif-des-comptages.component.html',
})
export class RecapitulatifDesComptagesComponent implements OnInit, OnDestroy {
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  TypeComptageEnum = TypeComptageEnum;
  clotureCaisseRecap$: Observable<IClotureCaisseRecapitulatif[]> =
    this.clotureCaisseStore.clotureCaisseRecap$;
  @Input() isValid: boolean;
  @Output() validerLaCloture = new EventEmitter<void>();
  public columnsReglementsSummaryTable = [
    'mode_reglement',
    'fond_de_caisse',
    'sortie_de_caisse',
    'total_compte',
    'total_a_controller',
    'total_factures_reglees',
    'difference',
    'nb_factures',
    'commentaire',
    'actions',
  ];
  subscription = new Subscription();
  public fondCaisseFinal: FormControl<number> = new FormControl(null, [
    Validators.required,
    Validators.min(0),
  ]);
  constructor(
    private clotureCaisseStore: ClotureCaisseStore,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.fondCaisseFinal.markAsDirty();
  }
  /**
   * redirection vers la page de reglement
   * @param {IClotureCaisseRecapitulatif} element
   */
  goToReglement(element: IClotureCaisseRecapitulatif) {
    this.subscription.add(
      this.store
        .pipe(select(ModesReglementsSelector))
        .subscribe((modesReglements: IModeReglement[]) => {
          const modeReglement = modesReglements.find(
            (r) =>
              r.code ===
              mapTypeComptageEnumReglementCode.get(element.mode_reglement)
          );
          if (modeReglement) {
            this.clotureCaisseStore.goToReglement(modeReglement.id);
          }
        })
    );
  }

  /**
   * enregistrer le fond de caisse final dans le store
   */
  setFondCaisseFinal() {
    this.clotureCaisseStore.setFondCaisseFinal(this.fondCaisseFinal.value);
  }

  /**
   * enregistrer l'écart dans le store
   * @param {string} commentaire
   * @param {TypeComptageEnum} type
   * @param {number} montant
   */
  setEcart(commentaire: string, type: TypeComptageEnum, montant: number) {
    if (!!commentaire) {
      const ecart: IEcart = { type, commentaire, montant };
      this.clotureCaisseStore.setEcart(ecart);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
