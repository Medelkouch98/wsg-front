import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExportsStore } from '../../../exports.store';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { IExportsSearchFormGroup } from '../../../models';
import { FormControlErrorPipe } from '@app/pipes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subscription } from 'rxjs';
import {
  CustomDateMaskDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import {
  ICategorie,
  IClient,
  IExportEtatRequest,
  IResource,
  ITypeControle,
} from '@app/models';
import { ExportTypeEnum, TypePersonneEnum } from '@app/enums';
import { ExportEtatEnum } from '../../../enums/export-etat.enum';
import { ClientAutocompleteComponent } from '@app/components';
import * as moment from 'moment';
import { MatInputModule } from '@angular/material/input';
import { select, Store } from '@ngrx/store';
import * as resourcesSelector from '../../../../../../core/store/resources/resources.selector';
import { AppState } from '../../../../../../core/store/app.state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-exports-search-form',
  standalone: true,
  imports: [
    MatButtonModule,
    TranslateModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormControlErrorPipe,
    MatTooltipModule,
    CustomDateMaskDirective,
    NgIf,
    MatSelectModule,
    NgForOf,
    MarkRequiredFormControlAsDirtyDirective,
    ClientAutocompleteComponent,
    MatInputModule,
    AsyncPipe,
  ],
  templateUrl: './exports-search-form.component.html',
})
export class ExportsSearchFormComponent implements OnInit, OnDestroy {
  public searchForm: FormGroup<IExportsSearchFormGroup>;
  private searchFormSub: Subscription = new Subscription();
  ExportEtatEnum = ExportEtatEnum;
  TypePersonneEnum = TypePersonneEnum;
  // WSO2-274 Retirer les trois derniers états (pour l’instant) de la liste déroulante “Etat”
  public exportEtatTypes: string[] = Object.values(ExportEtatEnum).filter(
    (etat: string) => +etat < 14
  );
  public exportFileTypes: string[] = Object.values(ExportTypeEnum);
  //TODO:rename & fix values when the backend is ready
  public searchByList: IResource[] = [
    { code: 1, libelle: 'Activité financière du jour' },
    { code: 2, libelle: 'Règlements du jour' },
    {
      code: 3,
      libelle: 'Liste des règlements pour les contrôles/avoirs/refact du jour',
    },
    {
      code: 4,
      libelle: 'Liste des règlements pour des factures des jours antérieurs',
    },
  ];
  public palierKilometrage: IResource[] = [
    { code: 1, libelle: '0, à 50 000 km' },
    { code: 2, libelle: '100, 001 à 150 000' },
    { code: 3, libelle: '150, 001 à 200 000 km' },
    { code: 4, libelle: '200 001 à 250 000 km' },
    { code: 5, libelle: '250 001 à 300 000 km' },
  ];

  typesControle$: Observable<ITypeControle[]> = this.store.pipe(
    select(resourcesSelector.TypesControleSelector),
    map((typesControle) =>
      typesControle.filter((type) =>
        ['VTP', 'CV', 'VTC', 'CVC'].includes(type.code)
      )
    )
  );
  categories$: Observable<ICategorie[]> = this.store.pipe(
    select(resourcesSelector.CategoriesSelector),
    map((categories) =>
      categories.filter((categorie) =>
        [
          'M1',
          'N1',
          'VTC',
          'ECOLE',
          'DEPAN',
          'VLTP',
          'TAXI',
          'COL',
          'SANIT',
        ].includes(categorie.code)
      )
    )
  );
  public minStartDate: Date;
  public maxEndDate: Date;

  constructor(
    private fb: FormBuilder,
    private exportsStore: ExportsStore,
    private store: Store<AppState>
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.searchFormSub.add(
      this.exportsStore.searchForm$.subscribe(
        (searchForm: IExportEtatRequest) => {
          this.searchForm.patchValue(searchForm);
        }
      )
    );
    this.searchForm.controls.type_etat.valueChanges.subscribe(
      (etatType: ExportEtatEnum) => {
        this.handleClientField(etatType);
        this.handleLibellePrestationField(etatType);
        this.handleNumeroCaisseField(etatType);
        this.handlePartenaireFields(etatType);
        this.handleMandatFields(etatType);
        this.handleNumeroFactureField(etatType);
        this.handleNumeroRapportField(etatType);
        this.handleTypeControleField(etatType);
        this.handleCategorieField(etatType);
        this.handleSearchByField(etatType);
        this.handleKilometrageField(etatType);
      }
    );
  }

  /**
   * Créer le formulaire de recherche
   */
  private createForm(): void {
    this.searchForm = this.fb.group<IExportsSearchFormGroup>({
      date_debut: new FormControl(null, Validators.required),
      date_fin: new FormControl(null, Validators.required),
      type_etat: new FormControl(null, Validators.required),
      file_type: new FormControl(null, Validators.required),
    });
  }

  ngOnDestroy(): void {
    this.searchFormSub?.unsubscribe();
  }

  /**
   * réinitialiser le formulaire de recherche
   */
  resetSearchForm(): void {
    this.exportsStore.resetSearchForm();
  }

  /**
   * demande d'export d'état
   */
  public exportEtat(): void {
    const formValue = this.searchForm.value;
    let exportEtatRequest: IExportEtatRequest = {
      date_debut: formValue.date_debut
        ? moment(formValue.date_debut, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
      date_fin: formValue.date_fin
        ? moment(formValue.date_fin, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : null,
      type_etat: formValue.type_etat,
      file_type: formValue.file_type,
    };

    if (formValue.client) {
      exportEtatRequest.id_client = formValue.client.id;
      exportEtatRequest.nom_client = formValue.client.nom;
      exportEtatRequest.code_client = formValue.client.code_client;
      exportEtatRequest.type_client = formValue.client.type;
      delete formValue.client;
    }
    exportEtatRequest = { ...formValue, ...exportEtatRequest };

    this.exportsStore.setSearchForm(exportEtatRequest);
    this.exportsStore.exportEtat();
  }

  /**
   * gerer l'affichage des champs, si l'etat exist dans (options), les champs (fields) doivent être
   * affichés sinon ils doivent être cachés
   * @param {ExportEtatEnum} etatType
   * @param {ExportEtatEnum[]} options
   * @param {string[]} fields
   * @private
   */
  private handleFieldsVisibility(
    etatType: ExportEtatEnum,
    options: ExportEtatEnum[],
    fields: Map<keyof IExportsSearchFormGroup, FormControl>
  ): void {
    if (options.includes(etatType)) {
      for (const [name, value] of fields) {
        this.searchForm.addControl(name, value);
      }
    } else {
      for (const name of fields.keys()) {
        this.searchForm.removeControl(name);
      }
    }
  }

  /**
   * gerer l'affichage du champ : numero_caisse
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleNumeroCaisseField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatRecapitulatifDesCloturesEtEncaissements],
      new Map([['numero_caisse', new FormControl<string>(null)]])
    );
  }

  /**
   * gerer l'affichage du champ : kilometrage
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleKilometrageField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatTauxDeContreVisite],
      new Map([['kilometrage', new FormControl<number>(-1)]])
    );
  }

  /**
   * gerer l'affichage du champ : numero_rapport
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleNumeroRapportField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [
        ExportEtatEnum.EtatListeDesControlesNonFactures,
        ExportEtatEnum.EtatListeDesControles,
      ],
      new Map([['numero_rapport', new FormControl<string>(null)]])
    );
  }

  /**
   * gerer l'affichage des champs : code_partenaire & nom_partenaire
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handlePartenaireFields(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatDesPartenaires],
      new Map([
        ['code_partenaire', new FormControl<string>(null)],
        ['nom_partenaire', new FormControl<string>(null)],
      ])
    );
  }

  /**
   * gerer l'affichage des champs : numero_mandat & nom_mandat
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleMandatFields(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatDesMandants],
      new Map([
        ['numero_mandat', new FormControl<string>(null)],
        ['nom_mandat', new FormControl<string>(null)],
      ])
    );
  }

  /**
   * gerer l'affichage du champ : type_controle_id
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleTypeControleField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [
        ExportEtatEnum.EtatTauxDeContreVisite,
        ExportEtatEnum.EtatProductionParAnneeImmatriculation,
      ],
      new Map([['type_controle_id', new FormControl<number>(null)]])
    );
  }

  /**
   * gerer l'affichage du champ : categorie_id
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleCategorieField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatProductionParAnneeImmatriculation],
      new Map([['categorie_id', new FormControl<number>(null)]])
    );
  }

  /**
   * gerer l'affichage du champ : search_by
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleSearchByField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatSyntheseFinanciereJournee],
      new Map([['search_by', new FormControl<number>(-1)]])
    );
  }

  /**
   * gerer l'affichage du champ : numero_facture
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleNumeroFactureField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [
        ExportEtatEnum.EtatDesClientsAvecFacturesEtAvoirs,
        ExportEtatEnum.EtatJournalDesVentes,
        ExportEtatEnum.EtatReleveDesEncours,
        ExportEtatEnum.EtatListeDesControles,
        ExportEtatEnum.EtatJournalDesModificationsDesReglements,
      ],
      new Map([['numero_facture', new FormControl<string>(null)]])
    );
  }

  /**
   * gerer l'affichage du champ : libelle_prestation
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleLibellePrestationField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [ExportEtatEnum.EtatCADesPrestations],
      new Map([['libelle_prestation', new FormControl<string>(null)]])
    );
  }

  /**
   * gerer l'affichage du champ : client
   * @param {ExportEtatEnum} etatType
   * @private
   */
  private handleClientField(etatType: ExportEtatEnum): void {
    this.handleFieldsVisibility(
      etatType,
      [
        ExportEtatEnum.EtatDesClientsAvecFacturesEtAvoirs,
        ExportEtatEnum.EtatActiviteGlobaleDesClientsPro,
        ExportEtatEnum.EtatListeDesControles,
        ExportEtatEnum.EtatListeDesControlesNonFactures,
        ExportEtatEnum.EtatReleveDesEncours,
        ExportEtatEnum.EtatJournalDesVentes,
      ],
      new Map([['client', new FormControl<IClient>(null)]])
    );
  }

  /**
   *  Mettre à jour la date maximale de fin en fonction de la date de début
   * @param event
   */
  updateEndDateMin(event: MatDatepickerInputEvent<Date>): void {
    this.maxEndDate = moment(event.value).add(1, 'year').toDate();
    this.minStartDate = null;
  }

  /**
   *  Mettre à jour la date minmale de début en fonction de la date de fin
   * @param event
   */
  updateStartDateMax(event: MatDatepickerInputEvent<Date>) {
    this.minStartDate = moment(event.value).subtract(1, 'year').toDate();
    this.maxEndDate = null;
  }
}
