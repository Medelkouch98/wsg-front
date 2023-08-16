import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MenuItemsService } from '@app/services';
import * as authSelector from '../../../core/store/auth/auth.selectors';
import {
  MenuFavorisSelector,
  UserSelector,
} from '../../../core/store/auth/auth.selectors';
import { ChildrenItems, ICurrentUser, ISidebarState, Menu } from '@app/models';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import * as authActions from '../../../core/store/auth/auth.actions';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
} from '@angular/router';
import {
  AccordionAnchorDirective,
  AccordionDirective,
  AccordionLinkDirective,
} from '@app/directives';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { MenuTypeEnum } from '@app/enums';
import { map } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarStatsPipe } from '../../../shared/pipes/sidebar-stats.pipe';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-vertical-sidebar',
  standalone: true,
  imports: [
    TranslateModule,
    AsyncPipe,
    NgIf,
    NgFor,
    RouterLinkWithHref,
    RouterLink,
    RouterLinkActive,
    AccordionDirective,
    AccordionLinkDirective,
    AccordionAnchorDirective,
    NgClass,
    MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatTooltipModule,
    SidebarStatsPipe,
    NgStyle,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  templateUrl: './vertical-sidebar.component.html',
  styleUrls: [],
})
export class VerticalAppSidebarComponent implements OnInit, OnDestroy {
  favoriteItems$: Observable<ChildrenItems[]> = this.store.pipe(
    select(MenuFavorisSelector)
  );
  favoriteItems: ChildrenItems[] = [];
  subscription: Subscription = new Subscription();
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
  mobileQuery: MediaQueryList;
  status = true;
  itemSelect: number[] = [];
  private _mobileQueryListener: () => void;
  showMenu = '';
  user$: Observable<ICurrentUser> = this.store.pipe(select(UserSelector));
  wsgItems$: Observable<Menu[]> = this.store.pipe(
    select(authSelector.MenusSelector),
    map((menu: Menu[]) =>
      menu.filter((item: Menu) => item.type !== MenuTypeEnum.ExtLink)
    )
  );
  extItems$: Observable<Menu[]> = this.store.pipe(
    select(authSelector.MenusSelector),
    map((menu: Menu[]) =>
      menu.filter((item: Menu) => item.type === MenuTypeEnum.ExtLink)
    )
  );

  stats: ISidebarState[] = [
    {
      state: 'activity',
      value: 20,
    },
    {
      state: 'client',
      value: 450,
    },
    {
      state: 'apporteur-affaire',
      value: 50,
    },
    {
      state: 'compteurs',
      value: 3,
    },
    {
      state: 'liasse',
      value: 35,
    },
  ];

  public menuTypeEnum = MenuTypeEnum;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItemsService,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // @deprecated: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.favoriteItems$.subscribe((favoriteItems: ChildrenItems[]) => {
        this.favoriteItems = [...favoriteItems];
      })
    );
  }

  scrollToTop() {
    document.querySelector('.page-wrapper')?.scroll({
      top: 0,
      left: 0,
    });
  }

  /**
   * Expand subChild menu
   * @param element
   */
  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  /**
   * Closing side-nav on clicking router link for small devices
   */
  handleNotify() {
    if (window.innerWidth < 1024) {
      this.notify.emit();
    }
  }

  /**
   * Add or remove an item from a favorite list
   * @param item ChildrenItems
   * @param e Event
   */
  handleFavorite(item: ChildrenItems, e: Event) {
    const existIndex = this.favoriteItems.findIndex(
      (favori: ChildrenItems) => favori.id === item.id
    );
    const menuFavoris =
      existIndex !== -1
        ? [
            ...this.favoriteItems.slice(0, existIndex),
            ...this.favoriteItems.slice(existIndex + 1),
          ]
        : [...this.favoriteItems, item];
    this.store.dispatch(authActions.UpdateMenuFavoris({ menuFavoris }));
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   * check if the item in favorite list
   * @param item
   * @return boolean
   */
  isFavorite(item: ChildrenItems): boolean {
    return !!this.favoriteItems.find(
      (favoriteItem: ChildrenItems) => favoriteItem.id === item.id
    );
  }

  drop(event: CdkDragDrop<ChildrenItems[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.store.dispatch(
      authActions.UpdateMenuFavoris({
        menuFavoris: event.container.data,
      })
    );
  }

  /**
   * Navigates to a specific route or opens an external link based on the menu item type
   * @param {Menu} menuItem
   */
  public onNavigate(menuItem: Menu): void {
    if (menuItem.type === MenuTypeEnum.Sub) return;
    if (menuItem.type === MenuTypeEnum.ExtLink) window.open(menuItem.state);
    if (menuItem.type === MenuTypeEnum.Link)
      this.router.navigate(['/p', menuItem.state]);
    this.handleNotify();
  }

  ngOnDestroy(): void {
    // @deprecated: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.subscription.unsubscribe();
  }
}
