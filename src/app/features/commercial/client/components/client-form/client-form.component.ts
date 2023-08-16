import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IClient } from '@app/models';
import { ClientStore } from '../../client.store';
import { Observable, Subscription } from 'rxjs';
import { ClientFormIdentificationComponent } from './client-form-identification/client-form-identification.component';
import { ClientFormFacturationComponent } from './client-form-facturation/client-form-facturation.component';
import { AppState } from '../../../../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { map } from 'rxjs/operators';
import { PermissionType, TypePersonneEnum } from '@app/enums';
import { IClientProContact } from '../../models';
import { ClientHistoriqueComponent } from './client-historique/client-historique.component';
import { ClientContactComponent } from './client-contact/client-contact.component';
import { UpperCasePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    NgIf,
    UpperCasePipe,
    TranslateModule,
    ClientFormIdentificationComponent,
    ClientFormFacturationComponent,
    ClientHistoriqueComponent,
    ClientContactComponent,
    MatExpansionModule,
    MatButtonModule,
  ],
  templateUrl: './client-form.component.html',
})
export class ClientFormComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  @Input() addMode: boolean;
  @ViewChild('clientIdentification')
  clientIdentificationView: ClientFormIdentificationComponent;
  @ViewChild('clientFacturation')
  clientFacturationView: ClientFormFacturationComponent;
  isIdentificationValidated$: Observable<boolean> =
    this.clientStore.isIdentificationValidated$;
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE) && !this.addMode
    )
  );
  typePersonneEnum = TypePersonneEnum;
  client: IClient;
  identificationPanelExpanded = true;
  isIdentificationValidated = false;
  contactsPanelExpanded = false;

  subscription: Subscription = new Subscription();

  constructor(
    public clientStore: ClientStore,
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.clientStore.client$.subscribe((client: IClient) => {
        this.client = client;
      })
    );
    this.subscription.add(
      this.isIdentificationValidated$.subscribe(
        (isIdentificationValidated: boolean) => {
          this.contactsPanelExpanded = isIdentificationValidated;
          this.isIdentificationValidated = isIdentificationValidated;
          this.identificationPanelExpanded =
            (isIdentificationValidated && !this.contactsPanelExpanded) ||
            !isIdentificationValidated;
        }
      )
    );
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  /**
   * vérifier si l'identification form et valide pour le cas de client passage
   * et si l'identification form et facturation form sont valide pour le cas de client pro
   * @return boolean
   */
  public isValid(): boolean {
    if (
      this.clientIdentificationView?.identificationForm.controls.type?.value ===
      1
    ) {
      return this.clientIdentificationView.identificationForm.valid;
    } else if (this.clientIdentificationView && this.clientFacturationView) {
      return (
        this.clientIdentificationView.identificationForm.valid &&
        this.clientFacturationView.facturationForm.valid
      );
    }
    return false;
  }

  /**
   * Ajouter client
   */
  public addClient(): void {
    const client = {
      ...this.clientIdentificationView?.identificationForm.getRawValue(),
      clientPro:
        this.clientIdentificationView?.identificationForm.controls.type
          .value === TypePersonneEnum.PASSAGE
          ? null
          : {
              ...this.client.clientPro,
              ...{
                contacts: this.client.clientPro.contacts?.filter(
                  (contact: IClientProContact) => contact.nom
                ),
                ...this.clientFacturationView?.facturationForm.getRawValue(),
              },
            },
    };
    this.clientStore.addClient(client);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.clientStore.initialiseClient();
  }
}
