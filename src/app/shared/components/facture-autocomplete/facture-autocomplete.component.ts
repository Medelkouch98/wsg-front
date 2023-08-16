import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldControlLabelDirective } from '@app/directives';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  IFacture,
  IWsError,
  PaginatedApiResponse,
  QueryParam,
  WsErrorClass,
} from '@app/models';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  finalize,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SharedService } from '@app/services';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ETAT_FACTURE } from '@app/config';
import { FormControlErrorPipe } from '@app/pipes';
import { FactureService } from '../../services/facture.service';

@Component({
  selector: 'app-facture-autocomplete',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    NgForOf,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    TranslateModule,
    NgIf,
    FieldControlLabelDirective,
    FormControlErrorPipe,
  ],
  templateUrl: './facture-autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FactureAutocompleteComponent,
      multi: true,
    },
  ],
})
export class FactureAutocompleteComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  private subscription = new Subscription();

  public searchFactureList: IFacture[] = [];
  public factureControl: FormControl<IFacture[]> = new FormControl([]);
  public factureInputControl = new FormControl();

  public message: string;
  public isLoading = false;

  @Input() label: string;
  @Input() extraFilters$: BehaviorSubject<QueryParam> =
    new BehaviorSubject<QueryParam>({});

  private onInputChange$: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );

  public onTouch: () => void;
  public onChange: (value: IFacture[]) => void;

  constructor(
    private factureService: FactureService,
    private translateService: TranslateService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.filterValues();
  }

  /**
   * filtrer et récupérer les infos des factures
   */
  filterValues() {
    this.subscription.add(
      combineLatest([this.onInputChange$, this.extraFilters$])
        .pipe(
          skip(1),
          debounceTime(300),
          tap(() => {
            this.message = '';
            this.isLoading = true;
          }),
          switchMap(([_, extras]: [string, QueryParam]) => {
            let queryParams: QueryParam = { ...extras };
            const numero_facture = this.factureInputControl.value;
            if (!!numero_facture) {
              queryParams.numero_facture = numero_facture;
            }
            if (Object.keys(queryParams).length === 0) {
              this.searchFactureList = [];
              return of([]);
            }
            queryParams.facture_status = ETAT_FACTURE.find(
              (f) => f.libelle === 'Non Soldée'
            )?.code;
            return this.getInvoices(queryParams);
          })
        )
        .subscribe()
    );
  }

  /**
   * chercher les factures
   * @param {QueryParam} queryParams
   * @return {Observable<PaginatedApiResponse<IFacture> | IWsError>}
   */
  getInvoices(
    queryParams: QueryParam
  ): Observable<PaginatedApiResponse<IFacture> | IWsError> {
    queryParams = {
      ...queryParams,
      page: 0,
      per_page: -1,
      sort: 'numero_facture',
    };
    return this.factureService.getInvoices(queryParams).pipe(
      tap(
        (response: PaginatedApiResponse<IFacture>) =>
          (this.searchFactureList = response?.data)
      ),
      catchError((error) => {
        const iWsError: IWsError = new WsErrorClass(error);
        iWsError.messageToShow = this.translateService.instant(
          'error.facturesFilter'
        );
        return of(iWsError);
      }),
      finalize(() => (this.isLoading = false))
    );
  }

  /**
   * sélectionner une facture
   */
  selectFacture() {
    const inputValue = this.factureInputControl.value;
    const factureList = this.factureControl.value || []; // Initialize factureList to an empty array if null
    if (inputValue && !factureList.includes(inputValue)) {
      this.factureControl.setValue([...factureList, inputValue]);
      this.factureInputControl.setValue('');
      this.onChange(this.factureControl.value);
      this.onTouch();
    }
  }

  /**
   * supprimer une facture
   * @param {IFacture} facture
   */
  removeFacture(facture: IFacture) {
    const factureList = this.factureControl.value.filter(
      (item: IFacture) => item.id !== facture.id
    );
    this.factureControl.setValue(factureList);
    this.onChange(this.factureControl.value);
    this.onTouch();
  }

  /**
   * to write a value into a form control
   * @param facture IFacture
   */
  writeValue(facture: IFacture[]) {
    this.factureControl.setValue(facture);
    if (!facture) {
      this.searchFactureList = [];
    }
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
   * écouter la saisie de l'input client
   * @param value string
   */
  onInputChange(value: string) {
    const minLength = 5;
    this.searchFactureList = [];
    if (!value || value?.toString().length < minLength) {
      this.message = this.sharedService.getAutocompleteSearchMsg(
        value,
        minLength
      );
      return;
    }
    if (!!value) {
      if (value?.toString().length >= minLength) {
        this.onInputChange$.next(value);
        return;
      }
    }
  }

  /**
   * Définir la valeur de l'option du controle dans l'autocomplete
   * @param facture IFacture
   * @return string
   */
  displayFnDefaultValues(facture: IFacture): string {
    if (facture) {
      return `${facture?.numero_facture}`;
    }
    return '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * déterminer si une facture est sélectionnée ou non
   * @param {IFacture} option
   * @return {boolean}
   */
  isSelected(option: IFacture): boolean {
    return this.factureControl.value?.some((f) => f.id === option.id);
  }
}
