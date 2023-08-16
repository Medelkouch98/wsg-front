import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SuiviFactureStore } from '../../suivi-facture.store';
import { Observable, Subscription } from 'rxjs';
import { SanitizeResourceUrlPipe } from '@app/pipes';
import { ActionsButtonsComponent } from '@app/components';
import { IActionsButton, IFacture } from '@app/models';
import { TranslateModule } from '@ngx-translate/core';
import { DirectionEnum, PermissionType } from '@app/enums';
import { switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureTypeEnum } from '../suivi-facture-search/enums';

@Component({
  selector: 'app-suivi-facture-details',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    SanitizeResourceUrlPipe,
    ActionsButtonsComponent,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './suivi-facture-details.component.html',
})
export class SuiviFactureDetailsComponent implements OnInit, OnDestroy {
  public facturePdf$: Observable<string> = this.factureStore.facturePdf$;
  public facture$: Observable<IFacture> = this.factureStore.facture$;
  public buttons: IActionsButton[] = [];
  private facture: IFacture;
  public typeFacture = (value: number) => {
    return Object.keys(FactureTypeEnum).find((key) => {
      // @ts-ignore
      return FactureTypeEnum[key] === String(value);
    });
  };
  private subscriptions: Subscription = new Subscription();
  constructor(
    private factureStore: SuiviFactureStore,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.route.params
        .pipe(
          tap(() => {
            this.factureStore.getInvoice({});
            this.factureStore.getFacturePdf();
          }),
          switchMap(() =>
            this.facture$.pipe(
              tap((facture: IFacture) => {
                this.facture = facture;
                this.buttons = [
                  {
                    libelle: 'commun.avoir',
                    direction: DirectionEnum.RIGHT,
                    action: 'goToAvoir',
                    permissions: [PermissionType.WRITE],
                    display: !!facture?.avoir_id && !facture?.avoir,
                  },
                  {
                    libelle: 'commun.email',
                    direction: DirectionEnum.RIGHT,
                    action: 'sendEmail',
                    permissions: [PermissionType.WRITE],
                  },
                  {
                    libelle: 'commun.duplicata',
                    direction: DirectionEnum.RIGHT,
                    action: 'downloadDuplicata',
                    permissions: [PermissionType.WRITE],
                  },
                ];
              })
            )
          )
        )
        .subscribe()
    );
  }

  /**
   * gestion des actions
   * @param action string
   */
  handleActions(action: string) {
    switch (action) {
      case 'downloadDuplicata':
        this.factureStore.downloadDuplicata();
        break;
      case 'sendEmail':
        this.factureStore.sendInvoiceByMail({
          id: this.facture?.id,
          numero_facture: this.facture?.numero_facture,
        });
        break;
      case 'goToAvoir':
        this.router.navigate(['p/gestion/factures', this.facture?.avoir_id]);
        break;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
