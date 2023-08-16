import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../../core/store/app.state';
import { PrestationStore } from '../../../prestation.store';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { GlobalHelper, TarificationHelper } from '@app/helpers';
import {
  IAgendaPrestationCategories,
  IAgendaPrestationElement,
  IPrestationAgendaFormDetails,
  IPrestationAgendaFormGroup,
  IPrestationIdentificationForm,
  IPrestationIdentificationFormGroup,
} from '../../../models';
import { IFamilleIT, ITva } from '@app/models';
import * as ResourcesSelector from '../../../../../../core/store/resources/resources.selector';
import { AsyncPipe, NgFor, NgForOf, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';
import {
  FieldControlLabelDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControlErrorPipe } from '@app/pipes';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CODE_PRESTATION, DEFAULT_AGENDA_COLOR } from '@app/config';

@Component({
  selector: 'app-prestation-identification',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    FieldControlLabelDirective,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    ColorPickerModule,
    MatExpansionModule,
    NgForOf,
    FormControlErrorPipe,
    MarkRequiredFormControlAsDirtyDirective,
  ],
  templateUrl: './prestation-identification.component.html',
})
export class PrestationIdentificationComponent implements OnInit, OnDestroy {
  @Input() addMode: boolean;
  @Input() isReadOnly$: Observable<boolean>;
  @Output() valid = new EventEmitter<boolean>();
  @Output() title = new EventEmitter<string>(true);

  isIdentificationValidated$: Observable<boolean> =
    this.prestationStore.IsIdentificationValidated$;

  agendaPrestationElements$: Observable<IAgendaPrestationElement[]> =
    this.prestationStore.AgendaPrestationElementsSelector$;
  agendaPrestationElements: IAgendaPrestationElement[];
  agendaPrestationCategories$: Observable<IAgendaPrestationCategories[]> =
    this.prestationStore.AgendaPrestationCategoriesSelector$;
  agendaPrestationCategories: IAgendaPrestationCategories[];
  public famillesIT$: Observable<IFamilleIT[]> = this.store.pipe(
    select(ResourcesSelector.FamillesITSelector)
  );

  tvas$: Observable<ITva[]> = this.store.pipe(
    select(ResourcesSelector.TVAsSelector)
  );

  isVP: boolean = false;
  tvas: ITva[];
  prestation: IPrestationIdentificationForm;
  identificationForm: FormGroup<IPrestationIdentificationFormGroup>;
  isIdentificationValidated = false;
  isValideClicked = false;
  showSuffix = false;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private prestationStore: PrestationStore,
    public store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.subscription.add(
      this.isReadOnly$.subscribe((isReadOnly: boolean) => {
        if (isReadOnly) {
          this.identificationForm.disable();
        } else {
          this.identificationForm.enable();
          //l'utilisateur ne saisi pas lui meme le prix ttc, ça depend du prix ht et le tva
          this.identificationForm.controls.prix_ttc.disable();
          //l'utilisateur ne saisi pas lui meme si c'est une prestation diverse ou non, la valeur depend du code, voir codeChange()
          this.identificationForm.controls.prestation_divers.disable();
        }
      })
    );
    this.subscription.add(
      this.agendaPrestationElements$.subscribe(
        (agendaPrestationElements) =>
          (this.agendaPrestationElements = agendaPrestationElements)
      )
    );
    this.subscription.add(
      this.agendaPrestationCategories$.subscribe(
        (agendaPrestationCategories) =>
          (this.agendaPrestationCategories = agendaPrestationCategories)
      )
    );
    this.subscription.add(
      this.prestationStore.PrestationSelector$.pipe(
        withLatestFrom(this.tvas$)
      ).subscribe(
        ([prestation, tvas]: [IPrestationIdentificationForm, ITva[]]) => {
          this.tvas = tvas;
          this.prestation = prestation;
          if (!!this.prestation?.agenda || this.addMode) {
            this.identificationForm.controls.agenda.controls.duration.addValidators(
              Validators.required
            );
            this.identificationForm.controls.agenda.controls.duration.updateValueAndValidity();
          }
          if (this.isValideClicked) {
            this.identificationForm.markAsPristine();
            this.isValideClicked = false;
          }
          if (!this.addMode && this.identificationForm.pristine) {
            this.identificationForm.patchValue(prestation);
            this.isVP = this.identificationForm.value?.code
              ?.toUpperCase()
              ?.startsWith('VP');
            this.setTTC(this.prestation?.tva_id);
          }
          this.emitTitle();
        }
      )
    );

    this.subscription.add(
      this.identificationForm.valueChanges
        .pipe(
          withLatestFrom(this.prestationStore.IsIdentificationValidated$),
          tap(
            ([, isIdentificationValidated]: [any, boolean]) =>
              (this.isIdentificationValidated = isIdentificationValidated)
          ),
          filter(
            ([, isIdentificationValidated]: [any, boolean]) =>
              isIdentificationValidated && this.identificationForm.dirty
          )
        )
        .subscribe(() => {
          this.prestationStore.SetIsIdentificationValidated(false);
        })
    );
  }

  /**
   * creation d'ajout de prestation
   */
  private createForm() {
    this.identificationForm = this.fb.group({
      id: [null],
      libelle: ['', Validators.required],
      code: [
        '',
        [
          Validators.required,
          Validators.pattern(CODE_PRESTATION),
          Validators.maxLength(5),
        ],
      ],
      numero_comptable: ['', Validators.maxLength(9)],
      actif: [true],
      prix_ht: ['', Validators.required],
      prix_ttc: [''],
      prestation_divers: [null],
      prestation_agenda_id: [null],
      soumis_redevance: [null],
      duree: [null],
      tva_id: [0, Validators.required],
      familles: [[] as number[]],
      agenda: this.fb.group({
        bo_name: [''],
        fo_name: [''],
        fo_description: [''],
        bo_description: [''],
        color: [DEFAULT_AGENDA_COLOR],
        price: [''],
        display_price: ['1'],
        display_duration: ['1'],
        enabled: ['1'],
        visible: ['1'],
        assurance_web: ['0'],
        duration: new FormControl<number>(null, Validators.min(1)),
        agendas: [[] as IPrestationAgendaFormDetails[]],
        categories: [[] as IPrestationAgendaFormDetails[]],
      }),
    });
  }

  get color(): string {
    return this.identificationForm.value.agenda.color;
  }

  set color($event) {
    const agenda: FormGroup<IPrestationAgendaFormGroup> =
      this.identificationForm.controls.agenda;
    agenda.get('color').setValue($event);
    agenda.get('color').markAsDirty();
  }

  /**
   * Construire le form value
   */
  identificationFormRequest() {
    //We need all the agendas/categories even the ones not selected
    let allAgendas: IPrestationAgendaFormDetails[] = this.getAllAgendas();
    let allCategories: IPrestationAgendaFormDetails[] = this.getAllCategories();
    //To do: remove value duplication on backend
    this.identificationForm.controls.duree.patchValue(
      this.identificationForm.value.agenda.duration
    );

    this.identificationForm.controls.agenda
      .get('price')
      .patchValue(this.identificationForm.controls.prix_ttc.value);

    let formValue: IPrestationIdentificationForm =
      this.identificationForm.getRawValue();
    delete formValue.prix_ttc;
    formValue.agenda.agendas = allAgendas;
    formValue.agenda.categories = allCategories;
    return formValue;
  }

  /**
   * modifier l'identification de la prestation
   */
  valider() {
    this.isValideClicked = true;
    // modifier la prestation
    let updatedValues = {};
    GlobalHelper.getUpdatedControles(this.identificationForm, updatedValues);
    if (updatedValues.hasOwnProperty('agenda')) {
      updatedValues = {
        ...updatedValues,
        agenda: this.identificationFormRequest().agenda, //the backend needs the entire agenda object for an update, not just the changed field(s)
      };
    }
    //mode update : on fait un patch directement
    this.prestationStore.UpdatePrestation({
      prestationId: this.prestation.id,
      data: updatedValues,
    });
  }

  getAllAgendas(): IPrestationAgendaFormDetails[] {
    return this.agendaPrestationElements?.map((agendaPrestationElement) => ({
      id: agendaPrestationElement.agenda_id,
      action: this.identificationForm.value.agenda.agendas.find(
        (formAgendaElement) =>
          formAgendaElement.id === agendaPrestationElement.agenda_id
      )
        ? 1
        : 0,
    }));
  }

  getAllCategories(): IPrestationAgendaFormDetails[] {
    return this.agendaPrestationCategories?.map(
      (agendaPrestationCategorie) => ({
        id: agendaPrestationCategorie.category_id,
        action: this.identificationForm.value.agenda.categories.find(
          (formCategorieElement) =>
            formCategorieElement.id === agendaPrestationCategorie.category_id
        )
          ? 1
          : 0,
      })
    );
  }

  emitTitle() {
    const data = this.identificationForm.value;
    this.title.emit(`${data.code} - ${data?.libelle}`);
  }

  /*
  set TTC à partir du TVA
   */
  setTTC(tva_id: number): void {
    const tva = this.tvas?.find((tva_: ITva) => tva_.id === tva_id);
    this.identificationForm.controls.prix_ttc.setValue(
      TarificationHelper.calculatePrixttc(
        this.identificationForm.value.prix_ht,
        tva?.taux
      ).toString()
    );
  }

  prixHTChange() {
    if (this.identificationForm.controls.tva_id.value) {
      this.setTTC(this.identificationForm.controls.tva_id.value);
    }
  }

  /*
  detection de changement de code et application des règles de gestion liées
   */
  codeChange() {
    this.emitTitle();
    this.identificationForm.controls.code.setValue(
      this.identificationForm.controls?.code.value?.toUpperCase()
    );
    this.showSuffix = this.identificationForm.value?.code
      ?.toUpperCase()
      ?.startsWith('OB');
    //soumis_redevance = true si code commence par OB
    this.identificationForm.controls.soumis_redevance.patchValue(
      this.identificationForm.value?.code?.toUpperCase()?.startsWith('OB')
    );
    //prestations_diverse = true si code commence par DI
    this.identificationForm.controls.prestation_divers.patchValue(
      this.identificationForm.value?.code?.toUpperCase()?.startsWith('DI')
    );
    this.identificationForm.controls.prestation_divers.markAsDirty();

    this.isVP = this.identificationForm.value?.code
      ?.toUpperCase()
      ?.startsWith('VP');
  }

  compareFn(e1: any, e2: any): boolean {
    return JSON.stringify(e1) === JSON.stringify(e2);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
