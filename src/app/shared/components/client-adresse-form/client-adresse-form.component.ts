import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ICivilite, IClient } from '@app/models';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ClientAutocompleteComponent } from '@app/components';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AdresseFormGroup, IAdresseFormGroup } from './models';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FieldControlLabelDirective } from '@app/directives';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { Observable } from 'rxjs/internal/Observable';
import { CiviliteByTypeAndStateSelector } from '../../../core/store/resources/resources.selector';
import { CivilitePipe } from '@app/pipes';
import { TypePersonneEnum } from '@app/enums';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-adresse-form',
  templateUrl: './client-adresse-form.component.html',
  standalone: true,
  imports: [
    MatCheckboxModule,
    ClientAutocompleteComponent,
    MatInputModule,
    TranslateModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgClass,
    FieldControlLabelDirective,
    AsyncPipe,
    CivilitePipe,
    NgForOf,
    NgIf,
    FormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ClientAdresseFormComponent,
      multi: true,
    },
  ],
})
export class ClientAdresseFormComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() showPassage: boolean = true;
  @Input() typePersonne = TypePersonneEnum.ALL;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  public onChange: (value: IClient) => void;
  public onTouch: () => void;
  public civilites$: Observable<ICivilite[]> = this.store.pipe(
    select(CiviliteByTypeAndStateSelector())
  );
  public adresseForm: FormGroup<IAdresseFormGroup>;
  public clientControl = new FormControl<IClient>(null);
  public isPassageChecked = false;
  public TypePersonneEnum = TypePersonneEnum;
  private subs: Subscription = new Subscription();
  private selectedClient: IClient;
  constructor(
    public translateService: TranslateService,
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.initForm();
    this.subs.add(
      this.clientControl.valueChanges.subscribe((client: IClient) => {
        if (!!client) {
          this.selectedClient = client;
          this.onChange(this.selectedClient);
          this.adresseForm.patchValue({
            ...client,
            code: client?.clientPro?.code,
          });
        }
      })
    );
  }

  /**
   * Initier le formulaire de recherche
   */
  private initForm(): void {
    this.adresseForm = this.fb.group(new AdresseFormGroup());
  }

  /**
   * to write a value into a form control
   * @param client IClient
   */
  writeValue(client: IClient) {
    this.adresseForm.patchValue({ ...client, code: client?.clientPro?.code });
    this.selectedClient = client;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
