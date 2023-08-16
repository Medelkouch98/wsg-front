import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  finalize,
  map,
  skip,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { TypeApporteurAffaire } from '@app/config';
import {
  IApporteurAffaire,
  IWsError,
  PaginatedApiResponse,
  WsErrorClass,
} from '@app/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FieldControlLabelDirective } from '@app/directives';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { ApporteurAffaireService, SharedService } from '@app/services';
import { MatOptionSelectionChange } from '@angular/material/core';
import { ApporteurAutoCompleteStore } from './apporteur-autocomplete.store';
import { ApporteurAffaireGroup } from './models';

export const _filter = (
  opt: IApporteurAffaire[],
  value: string
): IApporteurAffaire[] => {
  return opt.filter((item: IApporteurAffaire) => {
    return value.match(/^[0-9]*$/g)
      ? item.code.toString().indexOf(value.toString()) === 0
      : item.nom.toLowerCase().indexOf(value.toLowerCase()) === 0;
  });
};

@Component({
  selector: 'app-apporteur-affaire-autocomplete',
  templateUrl: './apporteur-affaire-autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ApporteurAffaireAutocompleteComponent,
      multi: true,
    },
    ApporteurAutoCompleteStore,
  ],
  imports: [
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MatAutocompleteModule,
    FieldControlLabelDirective,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  standalone: true,
})
export class ApporteurAffaireAutocompleteComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() typeApporteur = TypeApporteurAffaire.local;
  @Input() groupedAutoComplete = false;
  @Input() label = this.translateService.instant('gestion.factures.mandantNom');
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  public onChange: (value: IApporteurAffaire) => void;
  public onTouch: () => void;
  public message: string;
  public filtredApporteursList: IApporteurAffaire[] = [];
  public apporteurControl = new FormControl<string | IApporteurAffaire>('');
  public isLoading = false;
  private onInputChange$ = new BehaviorSubject<string>(null);
  public apporteurAffaireGroupOptions$: Observable<ApporteurAffaireGroup[]>;
  public apporteurAffaireGroups: ApporteurAffaireGroup[] = [
    {
      group: 'Nationaux',
      names: [],
    },
    {
      group: 'Locaux',
      names: [],
    },
  ];

  private _filterGroup(
    value: string | IApporteurAffaire
  ): ApporteurAffaireGroup[] {
    if (value && typeof value === 'string') {
      return this.apporteurAffaireGroups
        .map((apporteur: ApporteurAffaireGroup) => ({
          group: apporteur.group,
          names: _filter(apporteur.names, value),
        }))
        .filter(
          (apporteur: ApporteurAffaireGroup) => apporteur.names.length > 0
        );
    }

    return this.apporteurAffaireGroups;
  }
  private subscription: Subscription = new Subscription();

  constructor(
    private translateService: TranslateService,
    private apporteurAffaireService: ApporteurAffaireService,
    private sharedService: SharedService,
    private apporteurAutocompleteStore: ApporteurAutoCompleteStore
  ) {}

  ngOnInit() {
    if (this.groupedAutoComplete) {
      this.apporteurAutocompleteStore.getApporteurAffaire();
      this.subscription.add(
        combineLatest([
          this.apporteurAutocompleteStore.apporteurNationalList$,
          this.apporteurAutocompleteStore.apporteurLocalList$,
        ]).subscribe(
          ([apporteursNational, apporteurLocalList]: [
            IApporteurAffaire[],
            IApporteurAffaire[]
          ]) => {
            this.apporteurAffaireGroups = this.setListAutocomplete(
              apporteursNational,
              apporteurLocalList
            );
            this.apporteurAffaireFilter();
          }
        )
      );
      return;
    }
    this.filterApporteurs();
  }

  /**
   * Liste des apporteurs d'affaire pour l'autocomplete
   */
  apporteurAffaireFilter() {
    this.apporteurAffaireGroupOptions$ =
      this.apporteurControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterGroup(value))
      );
  }

  /**
   * Mettre à jour la liste des appoteurs d'affaire pour l'autocomplete
   * @return ApporteurAffaireGroup[]
   */
  setListAutocomplete(
    apporteurNationalList: IApporteurAffaire[],
    apporteurLocalList: IApporteurAffaire[]
  ): ApporteurAffaireGroup[] {
    return this.apporteurAffaireGroups.map(
      (apporteur: ApporteurAffaireGroup) => ({
        group: apporteur.group,
        names:
          apporteur.group === 'Nationaux'
            ? apporteurNationalList
            : apporteurLocalList,
      })
    );
  }

  /**
   * Concatener le code et le nom pour l'affichage de l'apporteur dans l'autocomplete
   * @param apporteur IApporteurAffaire
   * @return string
   */
  displayTextAutoCompleteApporteur(apporteur: IApporteurAffaire): string {
    return apporteur && apporteur.code
      ? apporteur.code + '-' + apporteur.nom
      : '';
  }

  /**
   * à l'ouverture de autocompletePanel on s'abonne à l'event panelClosingActions afin
   * de forcer la selection depuis le panel donc soit
   * on récupére la valeur de l'option sélectionner, soit on
   * sélectionne la première option disponible , si l'utilisateur n'a pas choisi d'option,
   * sinon on vide le champ si la recherche n'a pas de résultat
   */
  onOpenAutoComplete() {
    this.subscription.add(
      this.trigger.panelClosingActions
        .pipe(
          tap((e: MatOptionSelectionChange | null) => {
            const apporteur: IApporteurAffaire = !!e
              ? e.source.value
              : this.filtredApporteursList.length
              ? this.filtredApporteursList[0]
              : null;
            this.apporteurControl.setValue(apporteur);
            this.onInputChange(apporteur?.nom);
            this.onChange(this.apporteurControl.value as IApporteurAffaire);
            this.onTouch();
            this.trigger.closePanel();
          })
        )
        .subscribe()
    );
  }

  /**
   * to write a value into a form control
   * @param apporteurAffaire IApporteurAffaire
   */
  writeValue(apporteurAffaire: IApporteurAffaire) {
    this.apporteurControl.setValue(apporteurAffaire);
  }

  /**
   * report the value back to the parent form by calling a callback
   * @param fn
   */
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /**
   * report to the parent form that the control was touched
   * @param fn
   */
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  /**
   * Transmit the state to the form control using the setDisabledState method
   * @param isDisabled boolean
   */
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.apporteurControl.disable();
    } else {
      this.apporteurControl.enable();
    }
  }

  /**
   * Filtrer apporteur affaire
   */
  filterApporteurs(): void {
    this.subscription.add(
      this.onInputChange$
        .pipe(
          skip(1),
          debounceTime(300),
          tap(() => {
            this.message = '';
            this.isLoading = true;
          }),
          switchMap((value: string) => {
            const term = !!value.match(/^[0-9]*$/g) ? 'code' : 'nom';
            return this.apporteurAffaireService
              .searchApporteurAffaire(
                { [term]: value, per_page: -1 },
                this.typeApporteur
              )
              .pipe(
                tap(
                  (response: PaginatedApiResponse<IApporteurAffaire>) =>
                    (this.filtredApporteursList = response?.data)
                ),
                catchError((error) => {
                  const iWsError: IWsError = new WsErrorClass(error);
                  iWsError.messageToShow = this.translateService.instant(
                    'error.apporteurFilter'
                  );
                  return of(iWsError);
                }),
                finalize(() => (this.isLoading = false))
              );
          })
        )
        .subscribe()
    );
  }

  /**
   * écouter la saisie de l'input apporteur
   * @param value string
   */
  onInputChange(value: string) {
    if (this.groupedAutoComplete) return;
    this.filtredApporteursList = [];
    if (
      !value ||
      (!value?.match(/^[0-9]*$/g) && value?.toString().length < 3)
    ) {
      this.message = this.sharedService.getAutocompleteSearchMsg(value, 3);
    }
    if (!!value) {
      if (value?.match(/^[0-9]*$/g) || value?.toString().length > 2) {
        this.onInputChange$.next(value);
        return;
      }
    }
  }

  /**
   * Specify the value of the option in the autocomplete
   * @param apporteurAffaire IApporteurAffaire
   * @return string
   */
  displayFnDefaultValues(apporteurAffaire: IApporteurAffaire): string {
    if (apporteurAffaire) {
      const codeApporteur = apporteurAffaire?.code
        ? `${apporteurAffaire.code} - `
        : '';
      return `${codeApporteur}${apporteurAffaire?.nom}`;
    }
    return '';
  }

  /**
   * selectionner un apporteur
   * @param apporteur IApporteurAffaire
   */
  selectedOption(apporteur: IApporteurAffaire) {
    this.onChange(apporteur);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
