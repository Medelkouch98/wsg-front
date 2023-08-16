import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppState } from '../store/app.state';
import { PermissionType } from '@app/enums';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { GestionModulesService } from '@app/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import * as authActions from '../store/auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private gestionModulesService: GestionModulesService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkPermission(next, state);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkPermission(next, state);
  }

  /**
   * check permissions for current route
   * @param next ActivatedRouteSnapshot
   * @param state RouterStateSnapshot
   * @private
   */
  private checkPermission(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const url = next.data?.url ? next.data?.url : state.url;
    const accessPermissions: PermissionType[] = next.data?.accessPermissions
      ? next.data?.accessPermissions
      : [PermissionType.READ];
    return this.gestionModulesService
      .findPermissionsByUrl(url.split('?')[0])
      .pipe(
        map((permissions: PermissionType[]) => {
          if (
            accessPermissions.every((permission: PermissionType) =>
              permissions.includes(permission)
            )
          ) {
            this.store.dispatch(
              authActions.SetAccessPermissions({
                accessPermissions: permissions,
              })
            );
            return true;
          } else {
            this.toastrService.error(
              this.translateService.instant(_('error.accessDenied'))
            );
            this.store.dispatch(
              authActions.SetAccessPermissions({
                accessPermissions: [],
              })
            );
            this.router.navigate(['/p']);
            return false;
          }
        })
      );
  }
}
