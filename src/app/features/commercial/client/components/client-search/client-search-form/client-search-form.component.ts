import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ClientSearchFormGroup,
  IClientSearch,
  IClientSearchFormGroup,
} from '../../../models';
import { IResource } from '@app/models';
import { Subscription } from 'rxjs';
import { ClientStore } from '../../../client.store';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
  FieldControlLabelDirective,
  FormControlNumberOnlyDirective,
} from '@app/directives';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlErrorPipe } from '@app/pipes';
import { ETAT, TYPE_CLIENT } from '@app/config';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-client-search-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgIf,
    NgFor,
    TranslateModule,
    ReactiveFormsModule,
    FormControlNumberOnlyDirective,
    FieldControlLabelDirective,
    FormControlErrorPipe,
  ],
  templateUrl: './client-search-form.component.html',
})
export class ClientSearchFormComponent implements OnInit, OnDestroy {
  public etat: IResource[] = ETAT;
  public typeClient: IResource[] = TYPE_CLIENT;
  public showCodeClient = true;
  public searchForm: FormGroup<IClientSearchFormGroup>;
  private searchFormSub: Subscription;

  constructor(private fb: FormBuilder, private clientsStore: ClientStore) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initier le formulaire de recherche
   */
  private initForm(): void {
    this.searchFormSub = this.clientsStore.searchForm$.subscribe(
      (search: IClientSearch) =>
        (this.searchForm = this.fb.group(new ClientSearchFormGroup(search)))
    );
  }

  /**
   * Rechercher
   */
  public search(): void {
    this.clientsStore.setSearchForm(this.searchForm.getRawValue());
    this.clientsStore.clientsSearch();
  }

  /**
   * Réinitialiser la recherche
   */
  public resetSearchForm(): void {
    this.clientsStore.resetSearchForm();
  }

  /**
   * vider et cacher le code client dans le cas d'un client passage
   * apres le changement de type client
   * @param event MatSelectChange
   */
  public selectTypeClientChange(event: MatSelectChange): void {
    if (event.value === 1) {
      this.showCodeClient = false;
      this.searchForm.controls.code.setValue('');
    } else {
      this.showCodeClient = true;
    }
  }

  ngOnDestroy() {
    this.searchFormSub?.unsubscribe();
  }
}
