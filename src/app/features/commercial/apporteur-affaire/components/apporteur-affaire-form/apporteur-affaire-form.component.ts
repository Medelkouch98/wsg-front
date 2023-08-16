import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApporteurAffaireIdentificationComponent } from './apporteur-affaire-identification/apporteur-affaire-identification.component';
import { ApporteurAffaireContactComponent } from './apporteur-affaire-contact/apporteur-affaire-contact.component';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from '../../../../../core/store/app.state';
import { ApporteurAffaireStore } from '../../apporteur-affaire.store';
import { Observable } from 'rxjs/internal/Observable';
import { ITarification } from 'app/features/commercial/tarification/models';
import { map } from 'rxjs/operators';
import { TarificationComponent } from '../../../tarification/components/tarification.component';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { TypeApporteurAffaire } from '@app/config';
import { ApporteurAffaireRemiseComponent } from './apporteur-affaire-remise/apporteur-affaire-remise.component';
import { IApporteurAffaireLocal } from '@app/models';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-apporteur-affaire-form',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    UpperCasePipe,
    MatExpansionModule,
    MatButtonModule,
    ApporteurAffaireIdentificationComponent,
    ApporteurAffaireRemiseComponent,
    ApporteurAffaireContactComponent,
    TarificationComponent,
  ],
  templateUrl: './apporteur-affaire-form.component.html',
})
export class ApporteurAffaireFormComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  @ViewChild('apporteurIdentification')
  apporteurAffaireIdentificationView: ApporteurAffaireIdentificationComponent;
  @ViewChild('apporteurContacts')
  apporteurAffaireContactsView: ApporteurAffaireContactComponent;
  @ViewChild('apporteurRemises')
  apporteurAffaireRemisesView: ApporteurAffaireRemiseComponent;
  @ViewChild('apporteurTarifications')
  apporteurAffaireTarificationsView: TarificationComponent;
  @Input() addMode: boolean;
  @Input() typeApporteurAffaire: TypeApporteurAffaire;
  identificationPanelExpanded: boolean = true;
  contactsPanelExpanded: boolean = false;
  TypeApporteurAffaire = TypeApporteurAffaire;
  affaireAffaireLocal$: Observable<IApporteurAffaireLocal> =
    this.apporteurAffaireStore.ApporteurAffaireLocalSelector$;

  isIdentificationValidated$: Observable<boolean> =
    this.apporteurAffaireStore.IsIdentificationValidated$;
  isIdentificationValidated = false;
  tarifications$: Observable<ITarification[]> =
    this.apporteurAffaireStore.ApporteurAffaireLocalTarificationSelector$;
  remiseGlobal$: Observable<number> =
    this.apporteurAffaireStore.ApporteurAffaireLocalRemiseGlobalSelector$;
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE) ||
        this.typeApporteurAffaire === TypeApporteurAffaire.national
    )
  );
  subscription = new Subscription();
  apporteurId: number;

  public identificationTitle: string = '';

  constructor(
    public store: Store<AppState>,
    private apporteurAffaireStore: ApporteurAffaireStore,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.addMode) {
      this.apporteurAffaireStore.GetApporteurAffaire();
    }

    if (this.typeApporteurAffaire === TypeApporteurAffaire.local) {
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
      this.subscription.add(
        this.affaireAffaireLocal$.subscribe(
          (details: IApporteurAffaireLocal) => {
            this.apporteurId = details.id;
          }
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.apporteurAffaireStore.InitialiseApporteurAffaire();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  /*
   * Enregistrement de l'apporteur d'affaire
   * */
  saveApporteurAffaire() {
    this.apporteurAffaireStore.SaveApporteurAffaire();
  }

  /**
   * gestion de l'output du composant tarification
   * permet de faire l'enregistrement ou la modification directe, ou bien le patch du formulaire dans le store
   * @param tarification
   */
  addUpdateTarification(tarification: ITarification) {
    if (tarification.id) {
      //la tarification existe dans la BD, on la modifie directement
      this.apporteurAffaireStore.UpdateTarificationEffect(tarification);
    } else {
      //la tarification n'existe pas encore dans la BD
      if (!this.addMode) {
        this.apporteurAffaireStore.AddTarificationEffect(tarification);
      } else {
        //l'apporteur n'existe pas, on l'ajoute dans le store
        this.apporteurAffaireStore.AddTarification(tarification);
      }
    }
  }

  /**
   * gestion de l'output du composant tarification
   * permet la suppression directe du tarfication ou bien la suppression du store
   * @param tarification
   */
  deleteTarification(tarification: ITarification) {
    if (tarification.id) {
      this.apporteurAffaireStore.DeleteTarificationEffect(tarification);
    } else {
      this.apporteurAffaireStore.DeleteTarification(tarification);
    }
  }

  /**
   * gestion de l'output du composant tarification
   * enregistrement de la remise global
   * @param $event
   */
  saveRemiseGlobale($event: number) {
    if (!this.addMode) {
      this.apporteurAffaireStore.UpdateApporteurAffaire({
        apporteurId: this.apporteurId,
        data: { pourcentage_remise: $event },
      });
    } else {
      this.apporteurAffaireStore.SetRemiseGlobal($event);
    }
  }

  /**
   * vérifier si l'identification, les contacts et tarifications sont valides
   * @return boolean
   */
  isValid(): boolean {
    return (
      this.apporteurAffaireIdentificationView?.identificationForm.valid &&
      this.apporteurAffaireContactsView?.contactForm.valid &&
      this.apporteurAffaireTarificationsView?.tarificationForm.valid &&
      this.apporteurAffaireTarificationsView?.pourcentremise.valid
    );
  }
}
