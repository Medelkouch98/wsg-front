import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { IsAuthenticatedSelector } from '../store/auth/auth.selectors';
import { AppState } from '../store/app.state';

@Injectable({
  providedIn: 'root',
})
export class UnAuthGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.store.pipe(
      select(IsAuthenticatedSelector),
      take(1),
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.router.navigate(['/p'], {
            queryParams: { redirectUrl: state.url },
          });
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
