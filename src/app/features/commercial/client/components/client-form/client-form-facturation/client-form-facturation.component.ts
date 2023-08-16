import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IClient, IEcheance, IModeReglement } from '@app/models';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../../../../../../core/store/app.state';
import { ClientStore } from '../../../client.store';
import {
  EcheancesSelector,
  ModesReglementsNegocieSelector,
} from '../../../../../../core/store/resources/resources.selector';
import { ALPHA_NUMERIC } from '@app/config';
import { ITarification } from '../../../../tarification/models';
import { GlobalHelper } from '@app/helpers';
import { TarificationComponent } from '../../../../tarification/components/tarification.component';
import {
  FormControlNumberOnlyDirective,
  FieldControlLabelDirective, MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { IFacturationFormGroup } from '../../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-form-client-facturation',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    ReactiveFormsModule,
    TarificationComponent,
    FormControlNumberOnlyDirective,
    FieldControlLabelDirective,
    FormControlErrorPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatExpansionModule,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './client-form-facturation.component.html',
})
export class ClientFormFacturationComponent implements OnInit, OnDestroy {
  @Input() addMode: boolean;
  @Input() isReadOnly$: Observable<boolean>;
  echeance$: Observable<IEcheance[]> = this.store.pipe(
    select(EcheancesSelector)
  );
  modeReglementNegocie$: Observable<IModeReglement[]> = this.store.pipe(
    select(ModesReglementsNegocieSelector)
  );
  soldeClient$: Observable<number> = this.clientStore.soldeClient$;
  tarification$: Observable<ITarification[]> = this.clientStore.tarification$;

  clientId: number;
  isUpdateClicked = false;
  facturationForm: FormGroup<IFacturationFormGroup>;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private clientStore: ClientStore
  ) {
    this.createFacturationForm();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.isReadOnly$.subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.facturationForm.disable();
        } else {
          this.facturationForm.enable();
        }
      })
    );

    this.subscription.add(
      this.clientStore.client$.subscribe((client: IClient) => {
        this.clientId = client?.id;
        if (this.isUpdateClicked) {
          this.facturationForm.markAsPristine();
          this.isUpdateClicked = false;
        }
        // Modifier les valeurs de formulaire lorsqu'on est en mode de modification est le formulaire is pristine
        // pour éviter d'écraser ce qui est saisi au cas le client est modifié au niveau d'identification.
        if (!this.addMode && this.facturationForm.pristine) {
          this.facturationForm.patchValue(client?.clientPro);
        }
      })
    );
  }

  /**
   * créer le formulaire de facturation
   */
  createFacturationForm() {
    this.facturationForm = this.fb.group({
      echeance_id: [null],
      mode_reglement_id: [null],
      remise_pourcentage: [0, [Validators.min(0), Validators.max(100)]],
      facture_multipv_unitaire: [true],
      bon_commande_obligatoire: [false],
      mode_bon_livraison: [1],
      compte_comptable: ['', [Validators.maxLength(11)]],
      facture_releve: [true],
      tva_intracommunautaire: [
        '',
        [Validators.maxLength(20), Validators.pattern(ALPHA_NUMERIC)],
      ],
    });
  }

  /**
   * Ajouter ou modifier une tarification
   * @param tarification ITarification
   */
  addUpdateTarification(tarification: ITarification) {
    const { id, ...prestation } = { ...tarification };
    if (!this.addMode) {
      if (id) {
        this.clientStore.updateClientProPrestationExistingClient(tarification);
      } else {
        this.clientStore.addClientProPrestationExistingClient(prestation);
      }
    } else {
      this.clientStore.addOrUpdateTarification(prestation);
    }
  }

  /**
   * Supprimer une tarification
   * @param tarification ITarification
   */
  deleteTarification(tarification: ITarification) {
    if (tarification.id) {
      this.clientStore.deleteClientProPrestation(tarification);
    } else {
      this.clientStore.removeTarification(tarification);
    }
  }

  /**
   * Modifier la valeur de remise pourcentage
   * @param remise_pourcentage number
   */
  setPourcentageRemise(remise_pourcentage: number) {
    this.facturationForm.controls.remise_pourcentage.setValue(
      remise_pourcentage
    );
    this.facturationForm.controls.remise_pourcentage.markAsDirty();
  }

  /**
   * modifier les infos de facturation pour le client pro
   */
  updateClient() {
    this.isUpdateClicked = true;
    let updatedValues = {};
    GlobalHelper.getUpdatedControles(this.facturationForm, updatedValues);
    this.clientStore.updateClient({
      idclient: this.clientId,
      data: { clientPro: updatedValues },
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
