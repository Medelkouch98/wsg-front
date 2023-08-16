import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
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
export class AuthGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.pipe(
      select(IsAuthenticatedSelector),
      take(1),
      map((isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login'], {
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
