import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IModule } from '@app/models';
import { select, Store } from '@ngrx/store';
import * as authSelector from '../../core/store/auth/auth.selectors';
import { map, withLatestFrom } from 'rxjs/operators';
import * as routerSelector from '../../core/store/router/router.selector';
import { AppState } from '../../core/store/app.state';
import { PermissionType } from '@app/enums';
import { apiUrl4 } from '@app/config';

@Injectable({
  providedIn: 'root',
})
export class GestionModulesService {
  constructor(private http: HttpClient, private store: Store<AppState>) {}

  /**
   * Récupérer la liste des modules
   * @return Observable<IModules[]>
   */
  public getModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(`${apiUrl4}modules`);
  }

  /**
   * extract modules that match url
   * @return Observable<IModules[]>
   */
  public getModulesByUrl(): Observable<IModule[]> {
    return this.store.pipe(select(authSelector.ModulesSelector)).pipe(
      withLatestFrom(this.store.pipe(select(routerSelector.RouterUrlSelector))),
      map(([modulesList, url]: [IModule[], string]) => {
        // Diviser l'url par slash
        let splittedUrl = url.split('?')[0].split('/');
        let result: IModule[] = [];
        let parentPermission: PermissionType[] = [];
        splittedUrl.forEach((url: string) => {
          let m: IModule = modulesList?.find((m: IModule) => m.url === url);
          if (m) {
            let { modules, ...reste } = m;
            // in case the module don't have permission we use parent permission
            if (!m?.permissions || m?.permissions?.length === 0) {
              reste = {
                ...reste,
                permissions: parentPermission,
              };
            }
            parentPermission = m.permissions;
            result.push(reste);
            if (modules?.length > 0) {
              modulesList = modules;
              return true;
            }
          }
        });
        return result;
      })
    );
  }

  /**
   * find the permissions corresponding to a url
   * @param url string
   * @return Observable<PermissionType[]>
   */
  findPermissionsByUrl(url: string): Observable<PermissionType[]> {
    return this.store
      .pipe(select(authSelector.ModulesSelector))
      .pipe(
        map(
          (modules: IModule[]) =>
            this.findModuleByPathInListModules(modules, url.split('/'))
              ?.permissions || []
        )
      );
  }

  /**
   * search for the module that corresponds to the url in the list of modules while respecting the hierarchy
   * the method also handles the following cases:
   * - case 1: example url: 'commercial/customers/add' => the method returns the commercial module > customers > add
   * - case 2: module that has no children, example url: 'commercial/customers/view/1' => the method returns the commercial > customers > view module (because the view module has no children )
   * - case 3: url contains paths that do not match a module, example url: 'commercial/clients/xxx/yyyy/add' => the method returns the module commercial > clients > add (the method ignores paths that do not match to any module as long as the parent module has child modules)@param modules
   * @param modules IModule[]
   * @param url
   * @return IModule | null
   */
  public findModuleByPathInListModules(
    modules: IModule[],
    url: string[]
  ): IModule | null {
    let result = null;
    let modulesCopie = modules;
    let parent: IModule = null;
    do {
      let filtredModule = modulesCopie?.find(
        (module: IModule) => !!this.FindModuleByPathInModule(module, url[0])
      );
      if (filtredModule) {
        if (url.length === 1 || filtredModule.modules?.length === 0) {
          result = filtredModule;
          break;
        }
        parent = JSON.parse(JSON.stringify(filtredModule));
        modulesCopie = filtredModule?.modules;
      } else if (url.length === 1 && !!parent) {
        result = null;
      }
      url.shift();
    } while (url.length > 0 && !!modulesCopie);
    return result;
  }

  /**
   * Search module by Path
   * @param module IModule
   * @param path string
   * @return IModule
   * @private
   */
  private FindModuleByPathInModule(module: IModule, path: string): IModule {
    let result = null;
    if (module.url === path) {
      return module;
    }
    for (let i = 0; i < module?.modules?.length; i++) {
      result = this.FindModuleByPathInModule(module?.modules[i], path);
    }
    return result;
  }
}
