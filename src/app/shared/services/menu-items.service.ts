import { Injectable } from '@angular/core';
import { Menu, IModule, ChildrenItems } from '@app/models';
import { GestionModulesService } from './gestion-modules.service';

@Injectable({
  providedIn: 'root',
})
export class MenuItemsService {
  constructor(private gestionModulesService: GestionModulesService) {}

  /**
   * Generate the menu from the modules returned by the backend
   * @param modules IModule []
   * @return Menu[]
   */
  getMenuitem(modules: IModule[]): Menu[] {
    return modules
      .filter((groupModule: IModule) => groupModule.display_menu)
      .map((groupModule: IModule) => {
        return {
          id: groupModule.id,
          state: groupModule.url,
          route: groupModule.url,
          name: groupModule.nom,
          icon: groupModule.icon,
          type: groupModule.type,
          children: groupModule?.modules
            ?.filter((sub: IModule) => sub.display_menu)
            .map((sub: IModule) => {
              return {
                id: sub.id,
                state: sub.url,
                route: `${groupModule.url}/${sub.url}`,
                name: sub.nom,
                type: sub.type,
                subchildren: sub?.modules
                  ?.filter((subChild: IModule) => subChild.display_menu)
                  .map((subChild: IModule) => {
                    return {
                      id: subChild.id,
                      state: subChild.url,
                      route: `${groupModule.url}/${sub.url}/${subChild.url}`,
                      name: subChild.nom,
                      type: subChild.type,
                    };
                  }),
              };
            }),
        };
      });
  }

  checkFavoriteItemPermission(
    menuFavoris: ChildrenItems[],
    modules: IModule[]
  ): ChildrenItems[] {
    return menuFavoris?.filter((item: ChildrenItems) => {
      return !!this.gestionModulesService.findModuleByPathInListModules(
        modules,
        item.route.split('/')
      );
    });
  }
}
