import { MediaMatcher } from '@angular/cdk/layout';
import { Router, RouterOutlet } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppState } from '../../core/store/app.state';
import { select, Store } from '@ngrx/store';
import {
  LogoSettingsSelector,
  ThemeSettingsSelector,
} from '../../core/store/settings/settings.selectors';
import { map, merge, Observable, of, Subscription } from 'rxjs';
import {
  GetModesReglement,
  GetTypesControle,
  GetCategories,
  GetEnergie,
  GetCivilites,
  GetPrestations,
  GetEcheances,
  GetTVAs,
  GetFamillesIT,
  GetRoles,
  GetMarques,
} from '../../core/store/resources/resources.actions';
import { CalledRessourcesSelector } from '../../core/store/resources/resources.selector';
import { GetBandeauInformations } from 'app/core/store/settings/settings.actions';
import { GetCurrentUser } from '../../core/store/auth/auth.actions';
import {
  UnattachedControllersSelector,
  UserCurrentCentreSelector,
} from '../../core/store/auth/auth.selectors';
import { ICalledRessources, ICentre, IControleur } from '@app/models';
import { filter, tap } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppBreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AppInfoBarComponent } from './info-bar/info-bar.component';
import { VerticalAppSidebarComponent } from './vertical-sidebar/vertical-sidebar.component';
import { VerticalAppHeaderComponent } from './vertical-header/vertical-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserControleurAttachComponent } from '../../features/settings/users/components/user-controleur-attach/user-controleur-attach.component';
import { WebsocketsService } from '@app/services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DownloadProgressComponent } from '../../shared/components/download-progress/download-progress.component';

/** @title Responsive sidenav */
@Component({
  selector: 'app-components-layout',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    NgForOf,
    TranslateModule,
    NgScrollbarModule,
    RouterOutlet,
    AppBreadcrumbComponent,
    AppInfoBarComponent,
    VerticalAppSidebarComponent,
    VerticalAppHeaderComponent,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    DownloadProgressComponent,
  ],
  providers: [WebsocketsService],
  templateUrl: 'private-layout.component.html',
  styleUrls: ['private-layout.component.scss'],
})
export class PrivateLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenavContent') sidenavContent: MatSidenavContent;
  mobileQuery: MediaQueryList;
  sidebarOpened = false;
  private subscription = new Subscription();
  logo$: Observable<string>;
  theme$: Observable<string>;
  currentCenter$: Observable<ICentre>;
  public calledRessources$: Observable<ICalledRessources> = this.store.pipe(
    select(CalledRessourcesSelector)
  );
  public showSearch = false;

  // @deprecated - Disables all
  private _mobileQueryListener: () => void;

  displayScrollButton$ = merge(
    of(true),
    this.scroll.scrolled().pipe(
      map((data: any) => data.getElementRef().nativeElement.scrollTop || 0),
      map((scroll: number) => scroll < 150)
    )
  );

  constructor(
    public router: Router,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public store: Store<AppState>,
    private dialog: MatDialog,
    private websocketsService: WebsocketsService,
    public scroll: ScrollDispatcher
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // @deprecated import/no-deprecated
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  /**
   * Scroll to Top
   */
  scrollToTop() {
    this.sidenavContent.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.logo$ = this.store.pipe(select(LogoSettingsSelector));
    this.theme$ = this.store.pipe(select(ThemeSettingsSelector));
    this.currentCenter$ = this.store.pipe(select(UserCurrentCentreSelector));

    this.store.dispatch(GetBandeauInformations());
    this.store.dispatch(GetModesReglement());
    this.store.dispatch(GetTypesControle());
    this.store.dispatch(GetCategories());
    this.store.dispatch(GetEnergie());
    this.store.dispatch(GetCivilites());
    this.store.dispatch(GetPrestations());
    this.store.dispatch(GetEcheances());
    this.store.dispatch(GetTVAs());
    this.store.dispatch(GetFamillesIT());
    this.store.dispatch(GetRoles());
    this.store.dispatch(GetMarques());
    this.store.dispatch(GetCurrentUser());

    this.subscription.add(
      this.store
        .pipe(
          select(UnattachedControllersSelector),
          filter(
            (unattachedControllers: IControleur[]) =>
              !!unattachedControllers?.length
          ),
          tap((unattachedControllers: IControleur[]) =>
            this.showUnattachedControllersDialog(unattachedControllers)
          )
        )
        .subscribe()
    );
  }

  /**
   * Opens a dialog to attach unattached controllers to a user.
   * @param {IControleur[]} controleurs - The list of unattached controllers.
   * @returns {void}
   */
  private showUnattachedControllersDialog(controleurs: IControleur[]): void {
    // Prevent the opening of two dialogs (at login time)
    if (this.dialog.openDialogs.length) return;
    this.dialog.open(UserControleurAttachComponent, {
      data: { controleurs },
      minWidth: '100vw',
      height: '100vh',
      disableClose: true,
      autoFocus: false,
    });
  }

  /**

   Returns the URL of the logo to display based on the current centre and default logo.
   If the current centre has a logo, it returns that logo URL.
   If the current centre has a type label, it constructs the URL based on the type label.
   If neither condition is met, it returns the default logo URL.
   @param currentCentre - The current centre object.
   @param defaultLogo - The URL of the default logo.
   @returns The URL of the logo to display.
   */
  displayLogo(currentCentre: ICentre, defaultLogo: string): string {
    if (currentCentre?.logo) {
      return currentCentre.logo;
    } else if (currentCentre?.type_libelle) {
      return `../../../assets/images/${currentCentre.type_libelle.toLowerCase()}-logo-transparent.png`;
    } else {
      return defaultLogo;
    }
  }

  ngOnDestroy(): void {
    // @deprecated import/no-deprecated
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.subscription.unsubscribe();
    this.dialog.closeAll();
    this.websocketsService.close();
  }
}
