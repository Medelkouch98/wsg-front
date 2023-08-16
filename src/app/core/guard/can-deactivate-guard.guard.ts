import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
} from '@angular/router';

export interface ICanComponentDeactivate {
  canExit: () => boolean;
}

@Injectable()
export class CanDeactivateGuard
  implements CanDeactivate<ICanComponentDeactivate>
{
  canDeactivate(
    component: ICanComponentDeactivate,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return component.canExit ? component.canExit() : true;
  }
}
