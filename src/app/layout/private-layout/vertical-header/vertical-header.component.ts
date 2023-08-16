import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { SetLanguageAction } from '../../../core/store/settings/settings.actions';
import { SettingsLanguageSelector } from '../../../core/store/settings/settings.selectors';
import { Subscription } from 'rxjs';
import { ICentre } from '@app/models';
import * as authSelector from '../../../core/store/auth/auth.selectors';
import * as authActions from '../../../core/store/auth/auth.actions';
import { SUPPORTED_LANGUAGES } from '@app/config';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationPopupComponent } from '@app/components';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-vertical-header',
  standalone: true,
  imports: [
    TranslateModule,
    AsyncPipe,
    NgIf,
    NgFor,
    NgClass,
    RouterLinkWithHref,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatIconModule,
  ],
  templateUrl: './vertical-header.component.html',
  styleUrls: ['./vertical-header.component.scss'],
})
export class VerticalAppHeaderComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  public selectedLanguage: any;
  public languages: any[] = Object.values(SUPPORTED_LANGUAGES);
  public centres: ICentre[];
  public currentCentre: ICentre;
  handset: boolean;
  calendarCount: number = 0;
  notificationsCount: number = 0;

  constructor(
    private translate: TranslateService,
    public store: Store<AppState>,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router
  ) {
    translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    this.subscription.add(
      this.breakpointObserver
        .observe(Breakpoints.Handset)
        .subscribe((state: BreakpointState) => {
          this.handset = state.matches;
        })
    );

    this.subscription.add(
      this.store
        .pipe(select(SettingsLanguageSelector))
        .subscribe(
          (selectedLanguage: string) =>
            (this.selectedLanguage = SUPPORTED_LANGUAGES[selectedLanguage])
        )
    );
    this.subscription.add(
      this.store
        .pipe(select(authSelector.UserCurrentCentreSelector))
        .subscribe((currentCentre: ICentre) => {
          this.currentCentre = currentCentre;
        })
    );
    this.subscription.add(
      this.store
        .pipe(select(authSelector.UserCentresSelector))
        .subscribe((centres: ICentre[]) => {
          this.centres = centres;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Sélectionner la langue
   * @param lang
   * @returns void
   */
  changeLanguage(lang: any): void {
    this.store.dispatch(SetLanguageAction({ language: lang.code }));
    // this.translate.use(lang.code);
    // this.selectedLanguage = lang;
  }

  /**
   * Sélectionner le/les centres
   * @param currentCentre:ICentre[]
   * @returns void
   */
  public selectCenter(currentCentre: ICentre): void {
    if (this.currentCentre.id === currentCentre.id) return;
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translate.instant('commun.changementCentre'),
        deny: this.translate.instant('commun.non'),
        confirm: this.translate.instant('commun.oui'),
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['p']);
        this.store.dispatch(authActions.UpdateCurrentCentre({ currentCentre }));
        this.store.dispatch(authActions.SaveAuthState());
        this.store.dispatch(authActions.GetCurrentUserModules());
      }
    });
  }

  /**
   * Déconnexion de l'utilisateur
   * @returns void
   */
  logout(): void {
    this.store.dispatch(authActions.Logout({}));
  }

  /**
   * recuperer l'affichage du centre
   * @returns string
   */
  getCentreDisplay(centre: ICentre): string {
    //si le current centre à la meme taille que centres => tous les centres, sinon on affiche le centre lui meme
    let currentCentreDisplay = centre?.agrement;
    //si on est pas en mode mobile on affiche la ville
    if (!this.handset) {
      currentCentreDisplay += ` - ${centre?.ville}`;
    }
    return currentCentreDisplay;
  }
}
