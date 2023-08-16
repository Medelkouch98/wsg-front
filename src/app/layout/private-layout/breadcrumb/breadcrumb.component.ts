import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Data, NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  filter,
  distinctUntilKeyChanged,
  take,
  switchMap,
  tap,
} from 'rxjs/operators';
import { IModule } from '@app/models';
import { Subscription, Observable } from 'rxjs';
import { GestionModulesService } from '@app/services';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    NgForOf,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './breadcrumb.component.html',
})
export class AppBreadcrumbComponent implements OnDestroy {
  public pageInfo: Data = null;
  public currentUrl: string;
  public previousUrl: string;
  private routerSub: Subscription;

  constructor(
    private router: Router,
    private titleService: Title,
    private moduleService: GestionModulesService
  ) {
    // Used for refresh and visiting the app for the first time
    this.setBreadcrumbs().subscribe();
    // Detect the route change and retrieve the corresponding module
    this.routerSub = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        distinctUntilKeyChanged('url' as never),
        switchMap(() => this.setBreadcrumbs())
      )
      .subscribe();
  }

  /**
   * Set bradecrumb fragments
   * @returns {Observable<IModule[]>} fragments of the breadcrumbs
   */
  private setBreadcrumbs(): Observable<IModule[]> {
    return this.moduleService.getModulesByUrl().pipe(
      take(1),
      tap((modules: IModule[]) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = this.router.url; // store current url to use as previous after navigation
        const lastModule = modules.at(-1);
        this.titleService.setTitle(lastModule?.nom);
        this.pageInfo = {
          title: lastModule?.nom.toUpperCase(),
          urls: modules.map((module: IModule) => ({
            title: module.nom.toUpperCase(),
            url: module.url,
          })),
        };
      })
    );
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
