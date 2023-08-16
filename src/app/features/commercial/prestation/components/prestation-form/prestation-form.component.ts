import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { map } from 'rxjs/operators';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../core/store/app.state';
import { PrestationStore } from '../../prestation.store';
import { PaginatedApiResponse } from '@app/models';
import {
  IPrestationIdentificationForm,
  ITarificationPrice,
} from '../../models';
import { PrestationIdentificationComponent } from './prestation-identification/prestation-identification.component';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TarificationTableComponent } from './tarification-table/tarification-table.component';
import { NgIf, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-prestation-form',
  standalone: true,
  imports: [
    NgIf,
    UpperCasePipe,
    TranslateModule,
    MatExpansionModule,
    MatButtonModule,
    PrestationIdentificationComponent,
    TarificationTableComponent,
  ],
  templateUrl: './prestation-form.component.html',
})
export class PrestationFormComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  @Input() addMode: boolean;
  @ViewChild('prestationIdentification')
  prestationIdentification: PrestationIdentificationComponent;
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  public identificationTitle = '';
  public identificationPanelExpanded = true;
  public tarificationClient$: Observable<
    PaginatedApiResponse<ITarificationPrice>
  > = this.prestationStore.TarificationClientSelector$;

  public tarificationApporteurAffaires$: Observable<
    PaginatedApiResponse<ITarificationPrice>
  > = this.prestationStore.tarificationApporteurAffairesSelector$;

  public clientPageEvent$: Observable<PageEvent> =
    this.prestationStore.PageEventClientSelector$;
  public apporteurAffairePageEvent$: Observable<PageEvent> =
    this.prestationStore.PageEventApporteurAffaireSelector$;

  public clientSortEvent$: Observable<Sort> =
    this.prestationStore.SortClientSelector$;
  public apporteurAffaireSortEvent$: Observable<Sort> =
    this.prestationStore.SortApporteurAffaireSelector$;

  constructor(
    private store: Store<AppState>,
    public prestationStore: PrestationStore,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.prestationStore.GetAgendaPrestationElements();
    this.prestationStore.GetAgendaPrestationCategories();
    if (!this.addMode) {
      this.prestationStore.GetPrestation();
    }
  }
  ngOnDestroy(): void {
    this.prestationStore.InitialisePrestation();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  /**
   * vérifier si l'identification est valide
   * @return boolean
   */
  public isValid(): boolean {
    return this.prestationIdentification?.identificationForm.valid;
  }
  /*
   * Enregistrement de la prestation
   * */
  savePrestation() {
    let formValue: IPrestationIdentificationForm =
      this.prestationIdentification?.identificationFormRequest();
    this.prestationStore.SavePrestation(formValue);
  }

  /*
  changement de page pour la tarification client
   */
  clientPageChange($event: PageEvent) {
    this.prestationStore.SetClientPageEvent($event);
    this.prestationStore.GetTarificationClient();
  }
  /*
  changement de page pour la tarification apporteur affaire
   */
  apporteurAffairePageChange($event: PageEvent) {
    this.prestationStore.SetApporteurAffairePageEvent($event);
    this.prestationStore.GetTarificationApporteurAffaires();
  }

  /**
   * changer le tri pour la tarification client
   * @param $event
   */
  clientSortChange($event: Sort) {
    this.prestationStore.SetClientSort($event);
    this.prestationStore.GetTarificationClient();
  }
  /**
   * changer le tri  pour la tarification apporteur affaire
   * @param $event
   */
  apporteurAffaireSortChange($event: Sort) {
    this.prestationStore.SetApporteurAffaireSort($event);
    this.prestationStore.GetTarificationApporteurAffaires();
  }
}
