import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IActionsButton } from '@app/models';
import { DirectionEnum, PermissionType } from '@app/enums';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { filter, take, tap } from 'rxjs/operators';
import { GestionModulesService } from '@app/services';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { AccessPermissionsSelector } from '../../../core/store/auth/auth.selectors';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-actions-buttons',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './actions-buttons.component.html',
  animations: [
    trigger('fade', [
      state('in', style({ display: 'block' })),
      state('out', style({ display: 'none' })),
      transition('in => out', [animate('0.125s')]),
      transition('out => in', [animate('0.125s')]),
    ]),

    trigger('openClose', [
      state('open', style({ display: 'flex', opacity: 1 })),
      state('close', style({ display: 'none', opacity: 0 })),
      transition('open => close', [animate('0.125s ease-in')]),
      transition('close => open', [animate('0.125s ease-in')]),
    ]),
  ],
})
export class ActionsButtonsComponent {
  @Output() action: EventEmitter<string> = new EventEmitter<string>();
  @Input() set actionButtons(buttons: IActionsButton[]) {
    this.filterButtonsByPermissions(buttons);
  }
  isOpen: boolean = false;
  buttons: IActionsButton[] = [];
  DirectionEnum = DirectionEnum;
  // afficher les buttons actions si on a pas key display ou bien display est true
  displayButton = (button: IActionsButton) =>
    !button.hasOwnProperty('display') || button.display;
  defaultButtonColor: ThemePalette = 'primary';

  constructor(
    private moduleService: GestionModulesService,
    private store: Store<AppState>
  ) {}

  /**
   * Afficher seulement les buttons qui ont les permissions du module
   * @param buttons IActionsButton[]
   */
  filterButtonsByPermissions(buttons: IActionsButton[]) {
    this.store
      .pipe(
        select(AccessPermissionsSelector),
        take(1),
        filter(
          (modulePermissions: PermissionType[]) => !!modulePermissions?.length
        ),
        tap(
          (modulePermissions: PermissionType[]) =>
            (this.buttons = buttons?.filter((button: IActionsButton) =>
              button.permissions.some((permission: PermissionType) =>
                modulePermissions.includes(permission)
              )
            ))
        )
      )
      .subscribe();
  }

  /**
   * Ouvrir et fermer la liste des buttons
   */
  openCloseListButtons() {
    this.isOpen = !this.isOpen;
  }

  /**
   * émettre l'action en output
   * @param action string
   */
  emitAction(action: string) {
    this.action.emit(action);
  }

  /**
   * Filtrer les buttons par direction
   * @param direction DirectionEnum
   * @return IActionsButton[]
   */
  filterByDirection(direction: DirectionEnum): IActionsButton[] {
    return this.buttons.filter(
      (button: IActionsButton) => button.direction === direction
    );
  }
}
