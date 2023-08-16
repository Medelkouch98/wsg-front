import {
  Directive,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { IModule } from '@app/models';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../core/store/app.state';
import { tap } from 'rxjs/operators';
import { PermissionType } from '@app/enums';
import { Subscription } from 'rxjs';
import { AccessPermissionsSelector } from '../../core/store/auth/auth.selectors';

@Directive({
  selector: '[appIsGranted]',
  standalone: true,
})
export class IsGrantedDirective implements OnDestroy {
  subModules: IModule[] = [];
  private subscription = new Subscription();
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private store: Store<AppState>
  ) {}

  @Input() set appIsGranted(permissions: string[]) {
    if (!permissions?.length) return;
    this.subscription.add(
      this.store
        .pipe(
          select(AccessPermissionsSelector),
          tap((modulePermissions: PermissionType[]) =>
            this.isGranted(modulePermissions, permissions)
          )
        )
        .subscribe()
    );
  }

  /**
   * Vérifier que le module possède les autorisations indiquées dans les paramètres.
   * @param modulePermissions string
   * @param permissions PermissionType[]
   */
  isGranted(modulePermissions: PermissionType[], permissions: string[]) {
    if (
      modulePermissions?.some((permission: PermissionType) =>
        permissions.includes(permission)
      )
    ) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
