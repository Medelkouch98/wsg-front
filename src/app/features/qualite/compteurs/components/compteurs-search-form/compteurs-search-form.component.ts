import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompteursStore } from '../../compteurs.store';
import { MoisEnum } from '@app/enums';
import { TranslateModule } from '@ngx-translate/core';
import { FieldControlLabelDirective } from '@app/directives';
import { yearsFrom } from '@app/config';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { CompteursSearchFormGroup, ISearchCriteria } from '../../models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { MatInputModule } from '@angular/material/input';
import {
  CompteursHelper,
  FichierOTCButton,
} from '../../helpers/compteurs.helper';
import { FormControlErrorPipe } from '@app/pipes';
import { debounceTime, tap, withLatestFrom } from 'rxjs/operators';
import { IActionsButton, IControleur } from '@app/models';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-compteurs-search-form',
  standalone: true,
  templateUrl: './compteurs-search-form.component.html',
  imports: [
    MatAutocompleteModule,
    TranslateModule,
    ReactiveFormsModule,
    FieldControlLabelDirective,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    NgForOf,
    NgIf,
    AsyncPipe,
    FormControlErrorPipe,
  ],
})
export class CompteursSearchFormComponent implements OnInit, OnDestroy {
  public displayCheckCompteurSelector$: Observable<boolean> =
    this.compteursStore.DisplayCheckCompteurSelector$;
  public controleursSelector$: Observable<IControleur[]> =
    this.compteursStore.ControleursSelector$.pipe(
      tap((controleurs: IControleur[]) =>
        this.filtredControleurs$.next(controleurs)
      )
    );
  searchForm: FormGroup<CompteursSearchFormGroup>;
  subscription: Subscription = new Subscription();
  public MONTHS = Object.values(MoisEnum);
  states = ['justified', 'unjustified'];
  //niveau de gravité
  niveaux = [1, 2, 3];

  COMPTEURS_SEARCH_MIN_YEAR = 2017;
  years: number[] = yearsFrom(this.COMPTEURS_SEARCH_MIN_YEAR);
  onSearchControleur$: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );
  filtredControleurs$: BehaviorSubject<IControleur[]> = new BehaviorSubject<
    IControleur[]
  >([]);
  controleurs: IControleur[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private compteursStore: CompteursStore,
    private compteurHelper: CompteursHelper
  ) {}

  ngOnInit() {
    this.compteursStore.FetchControleurs();
    this.subscription.add(
      this.controleursSelector$.subscribe(
        (controleurs: IControleur[]) => (this.controleurs = controleurs)
      )
    );
    this.subscription.add(
      this.onSearchControleur$
        .pipe(
          debounceTime(400),
          withLatestFrom(this.compteursStore.ControleursSelector$),
          tap(([value, controleurs]: [string, IControleur[]]) => {
            const result = controleurs.filter((controleur: IControleur) =>
              controleur?.nom
                .trim()
                .toLowerCase()
                ?.includes(value?.toLowerCase())
            );
            this.filtredControleurs$.next(result);
          })
        )
        .subscribe()
    );
    this.initForm();
    this.search();
    this.subscription.add(
      this.searchForm.controls.year.valueChanges.subscribe((year: number) => {
        if (year === -1) {
          this.searchForm.controls.month.setValue(-1);
          this.searchForm.controls.month.disable();
        } else {
          this.searchForm.controls.month.enable();
        }
      })
    );
    this.subscription.add(
      this.searchForm.valueChanges
        .pipe(withLatestFrom(this.compteursStore.ActionsButtonsSelector$))
        .subscribe(
          ([searchForm, actionsButtons]: [
            Partial<ISearchCriteria>,
            IActionsButton[]
          ]) => {
            this.compteursStore.SetCompteursSearchCriteria(this.searchForm.getRawValue());
            this.handleFicherOtcButton(searchForm, actionsButtons);
          }
        )
    );
  }

  /**
   * handle FicheOtc button
   * @param searchForm
   * @param actionsButtons
   */
  handleFicherOtcButton(
    searchForm: Partial<ISearchCriteria>,
    actionsButtons: IActionsButton[] = []
  ) {
    const hasFichierOTCButton = actionsButtons.some(
      (button: IActionsButton) => button.action === 'fichierOTC'
    );
    if (
      searchForm.year !== -1 &&
      searchForm.month !== -1 &&
      !hasFichierOTCButton
    ) {
      this.compteursStore.SetActionsButtons([
        ...actionsButtons,
        FichierOTCButton,
      ]);
    } else if (
      !(searchForm.year !== -1 && searchForm.month !== -1) &&
      hasFichierOTCButton
    ) {
      this.compteursStore.SetActionsButtons(
        actionsButtons.filter(
          (button: IActionsButton) => button.action !== 'fichierOTC'
        )
      );
    }
  }

  /**
   * Initier le formulaire de recherche
   * @private
   */
  private initForm(): void {
    this.subscription.add(
      this.compteursStore.SearchCriteriaSelector$.subscribe(
        (searchForm: ISearchCriteria) => {
          this.searchForm = this.fb.group(searchForm, {
            validators: [this.compteurHelper.yearValidator()],
          });
          setTimeout(() => this.handleFicherOtcButton(this.searchForm.value));
        }
      )
    );
  }

  /**
   * recherche de compteur d'exception
   */
  search(): void {
    this.compteursStore.SetCompteursSearchCriteria(
      this.searchForm.getRawValue()
    );
    this.compteursStore.CompteursSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  resetSearchForm(): void {
    this.compteursStore.ResetSearchCriteria();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  checkCompteur($event: MatCheckboxChange) {
    if ($event.checked) {
      this.compteursStore.CheckCompteur();
    }
  }

  /**
   * Définir la valeur à afficher au niveau de l'autocompelete controleur
   * @param agrement string
   * @return string
   */
  displayWith = (agrement: string): string => {
    return agrement
      ? this.controleurs.find(
          (controleur: IControleur) => controleur.agrement_vl === agrement
        )?.nom
      : '';
  };
}
