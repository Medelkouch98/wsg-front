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
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  IClient,
  IWsError,
  PaginatedApiResponse,
  QueryParam,
  WsErrorClass,
} from '@app/models';
import { ClientService, SharedService } from '@app/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { TypePersonneEnum } from '@app/enums';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { FieldControlLabelDirective } from '@app/directives';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-client-autocomplete',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FieldControlLabelDirective,
    TranslateModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './client-autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ClientAutocompleteComponent,
      multi: true,
    },
  ],
})
export class ClientAutocompleteComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() label: string;
  @Input() typePersonne: TypePersonneEnum = TypePersonneEnum.ALL;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  public onChange: (value: IClient) => void;
  public onTouch: () => void;

  public message: string;
  public isLoading = false;
  public searchClientList: IClient[] = [];
  public clientControl = new FormControl<string | IClient>('');
  private subscription = new Subscription();
  private onInputChange$ = new BehaviorSubject<string>(null);
  constructor(
    private clientService: ClientService,
    private translateService: TranslateService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.filterValues();
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
            const client: IClient = !!e
              ? e.source.value
              : this.searchClientList.length
              ? this.searchClientList[0]
              : null;
            this.clientControl.setValue(client);
            this.onInputChange(client?.nom);
            this.onChange(this.clientControl.value as IClient);
            this.onTouch();
            this.trigger.closePanel();
          })
        )
        .subscribe()
    );
  }

  /**
   * to write a value into a form control
   * @param client IClient
   */
  writeValue(client: IClient) {
    this.clientControl.setValue(client);
    if (!client) {
      this.searchClientList = [];
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
   * handle disable state
   * @param {boolean} disabled
   */
  setDisabledState(disabled: boolean): void {
    disabled ? this.clientControl.disable() : this.clientControl.enable();
  }

  /**
   * filtrer et récupérer les infos du client
   */
  filterValues() {
    this.onInputChange$
      .pipe(
        skip(1),
        debounceTime(300),
        tap(() => {
          this.message = '';
          this.isLoading = true;
        }),
        switchMap((value: string) => {
          const term = value?.match(/^[0-9]*$/g) ? 'code' : 'nom';
          const queryParams: QueryParam = {
            [term]: value,
            per_page: -1,
            ...(this.typePersonne !== TypePersonneEnum.ALL && {
              ['type']: this.typePersonne,
            }),
          };
          return this.clientService.searchClients(queryParams).pipe(
            tap(
              (response: PaginatedApiResponse<IClient>) =>
                (this.searchClientList = response?.data)
            ),
            catchError((error) => {
              const iWsError: IWsError = new WsErrorClass(error);
              iWsError.messageToShow =
                this.translateService.instant('error.clientFilter');
              return of(iWsError);
            }),
            finalize(() => (this.isLoading = false))
          );
        })
      )
      .subscribe();
  }

  /**
   * écouter la saisie de l'input client
   * @param value string
   */
  onInputChange(value: string) {
    this.searchClientList = [];
    if (
      !value ||
      ((this.typePersonne === TypePersonneEnum.PASSAGE ||
        !value.match(/^[0-9]*$/g)) &&
        value.toString().length < 3)
    ) {
      this.message = this.sharedService.getAutocompleteSearchMsg(value, 3);
    }
    if (!!value) {
      if (
        (value?.match(/^[0-9]*$/g) &&
          this.typePersonne !== TypePersonneEnum.PASSAGE) ||
        value?.toString().length > 2
      ) {
        this.onInputChange$.next(value);
        return;
      }
    }
  }

  /**
   * Définir la valeur de l'option du controle dans l'autocomplete
   * @param client IClient
   * @return string
   */
  displayFnDefaultValues(client: IClient): string {
    if (client) {
      const codeClient = client?.clientPro?.code
        ? `${client.clientPro?.code} - `
        : '';
      return `${codeClient}${client?.nom}`;
    }
    return '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
