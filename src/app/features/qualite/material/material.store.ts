import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { SharedService } from '@app/services';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  IMaterialDisplayCategory,
  IMaterial,
  IMaterialCategory,
  IMaterialSearch,
  IMaterialSubType,
  IMaterialType,
  MaterialSearch,
  IMaterialModele,
  IMaterialMarque,
  IMaterialMaintenanceCompany,
  IMaterialFormGroupValue,
  MATERIAL_CATEGORIES,
  IMaterialEvent,
  IMaterialAlertResponse,
  IMaterialEventSelection,
  IMaterialEventType,
} from './models';
import { IWsError } from '@app/models';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, combineLatest, forkJoin, iif, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Params, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../core/store/app.state';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from './services/material.service';
import { RouterParamsSelector } from 'app/core/store/router/router.selector';
import { exportFile } from '@app/helpers';
import {
  filterMaterials,
  getMaterialsByCategory,
} from './helpers/material.helper';

export interface MaterialsState {
  materials: IMaterialDisplayCategory[];
  material: IMaterial;
  selectedMaterials: IMaterial[];
  searchForm: IMaterialSearch;
  types: IMaterialType[];
  subTypes: IMaterialSubType[];
  categories: IMaterialCategory[];
  modeles: IMaterialModele[];
  marques: IMaterialMarque[];
  maintenanceCompanies: IMaterialMaintenanceCompany[];
  eventTypes: IMaterialEventType[];
  alerts: IMaterialAlertResponse;
  openedEvent: IMaterialEvent;
  materialEvents: IMaterialEvent[];
  errors: IWsError;
}

export const initialMaterialsState: MaterialsState = {
  materials: [],
  searchForm: new MaterialSearch(),
  material: null,
  selectedMaterials: [],
  types: [],
  subTypes: [],
  categories: MATERIAL_CATEGORIES,
  modeles: [],
  marques: [],
  maintenanceCompanies: [],
  eventTypes: [],
  alerts: null,
  openedEvent: null,
  materialEvents: [],
  errors: null,
};
@Injectable()
export class MaterialStore extends ComponentStore<MaterialsState> {
  private materialService: MaterialService = inject(MaterialService);
  private translateService: TranslateService = inject(TranslateService);
  private router: Router = inject(Router);
  private store: Store<AppState> = inject(Store<AppState>);
  private toastr: ToastrService = inject(ToastrService);
  private sharedService: SharedService = inject(SharedService);

  // SELECTORS
  materials$ = this.select((state: MaterialsState) => state.materials);
  material$ = this.select((state: MaterialsState) => state.material);
  seaechedMaterial$ = this.select((state: MaterialsState) =>
    filterMaterials(state.materials, state.searchForm)
  );
  selectedMaterials$ = this.select(
    (state: MaterialsState) => state.selectedMaterials
  );
  searchForm$ = this.select((state: MaterialsState) => state.searchForm);
  types$ = this.select((state: MaterialsState) => state.types);
  subTypes$ = this.select((state: MaterialsState) => state.subTypes);
  subTypesByType$ = this.select((state: MaterialsState) =>
    state.types.map((type) => ({
      ...type,
      subTypes: state.subTypes.filter(
        ({ materiel_type_id }) => materiel_type_id === type.id
      ),
    }))
  );
  categories$ = this.select((state: MaterialsState) => state.categories);
  modeles$ = this.select((state: MaterialsState) => state.modeles);
  marques$ = this.select((state: MaterialsState) => state.marques);
  maintenanceCompanies$ = this.select(
    (state: MaterialsState) => state.maintenanceCompanies
  );
  eventTypes$ = this.select((state: MaterialsState) => state.eventTypes);
  alerts$ = this.select((state: MaterialsState) => state.alerts);
  openedEvent$ = this.select((state: MaterialsState) => state.openedEvent);
  materialEvents$ = this.select(
    (state: MaterialsState) => state.materialEvents
  );

  constructor() {
    super(initialMaterialsState);
  }

  // UPDATERS
  private setMaterials = this.updater(
    (state: MaterialsState, materials: IMaterial[]) => {
      return {
        ...state,
        materials: getMaterialsByCategory(
          materials,
          state.types,
          state.subTypes
        ),
      };
    }
  );

  public setSearchForm = this.updater(
    (state: MaterialsState, searchForm: IMaterialSearch) => {
      return {
        ...state,
        searchForm,
      };
    }
  );

  public resetSearchForm = () =>
    this.patchState({ searchForm: new MaterialSearch() });

  public initMaterial = () =>
    this.patchState({ material: null, materialEvents: [], alerts: null });

  public selectMaterials = this.updater(
    (state: MaterialsState, materials: IMaterial[]) => ({
      ...state,
      selectedMaterials: [...state.selectedMaterials, ...materials],
    })
  );

  public unselectMaterials = this.updater(
    (state: MaterialsState, materials: IMaterial[]) => ({
      ...state,
      selectedMaterials: materials.length
        ? [
            ...state.selectedMaterials.filter(
              (material) => !materials.includes(material)
            ),
          ]
        : [],
    })
  );

  private setWsError = (
    error: HttpErrorResponse,
    errorMessage: string,
    showToaster: boolean = true
  ) => {
    this.patchState({
      errors: this.sharedService.getWsError(
        error,
        'qualite.material.errors.' + errorMessage,
        showToaster
      ),
    });
    return of(error);
  };

  // EFFECTS
  public materialsSearch = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        combineLatest([
          this.materialService.getTypes(),
          this.materialService.getSubTypes(),
        ])
      ),
      switchMap(([types, subTypes]: [IMaterialType[], IMaterialSubType[]]) => {
        this.patchState({ types, subTypes });
        return this.getMaterials();
      }),
      catchError((error: HttpErrorResponse) =>
        this.setWsError(error, 'getTypes')
      )
    )
  );

  public getMaterial = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [any, Params]) =>
        this.materialService.getMaterial(+params['idmaterial']).pipe(
          tap((material: IMaterial) =>
            this.patchState({
              material,
              materialEvents: material.materiel_evenements,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            void this.router.navigate(['/p/qualite/materiel']);
            return this.setWsError(error, 'materialInfosFiche');
          })
        )
      )
    )
  );

  public getMarques = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_) =>
        this.materialService.getMarques().pipe(
          tap((marques: IMaterialMarque[]) => this.patchState({ marques })),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getMarques')
          )
        )
      )
    )
  );

  public getModeles = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_) =>
        this.materialService.getModeles().pipe(
          tap((modeles: IMaterialModele[]) => this.patchState({ modeles })),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getModeles')
          )
        )
      )
    )
  );

  public getMaintenanceCompanies = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_) =>
        this.materialService.getMaintenanceCompanies().pipe(
          tap((maintenanceCompanies: IMaterialMaintenanceCompany[]) =>
            this.patchState({ maintenanceCompanies })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getMaintenanceCompanies')
          )
        )
      )
    )
  );

  public getMaterialEventTypes = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap((_) =>
        this.materialService.getMaterialEventTypes().pipe(
          tap((eventTypes: IMaterialEventType[]) =>
            this.patchState({ eventTypes })
          ),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getMaterialEventTypes')
          )
        )
      )
    )
  );

  public addMaterial = this.effect(
    (material$: Observable<IMaterialFormGroupValue>) =>
      material$.pipe(
        switchMap((materialForm: IMaterialFormGroupValue) =>
          (
            this.saveMaintenanceCompany(materialForm) as Observable<IMaterial>
          ).pipe(
            switchMap((material: IMaterial) =>
              this.materialService.addMaterial(material).pipe(
                switchMap(() => {
                  // Handle response from addMaterial
                  this.toastr.success(
                    this.translateService.instant('commun.operationTerminee')
                  );
                  void this.router.navigate(['/p/qualite/materiel']); // Navigate to the specified route
                  return this.getMaterials(); // Perform a search for materials
                }),
                catchError(
                  (error: HttpErrorResponse) =>
                    this.setWsError(error, 'addMaterial') // Handle error in adding material
                )
              )
            )
          )
        )
      )
  );

  public updateMaterial = this.effect(
    (material$: Observable<Partial<IMaterialFormGroupValue>>) =>
      material$.pipe(
        switchMap((materialForm: Partial<IMaterialFormGroupValue>) =>
          this.saveMaintenanceCompany(materialForm).pipe(
            withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
            switchMap(([material, params]: [Partial<IMaterial>, Params]) =>
              this.materialService
                .updateMaterial(params['idmaterial'], material)
                .pipe(
                  switchMap(() => {
                    // Handle response from updateMaterial
                    this.toastr.success(
                      this.translateService.instant('commun.operationTerminee')
                    );
                    void this.router.navigate(['/p/qualite/materiel']); // Navigate to the specified route
                    return this.getMaterials(); // Perform a search for materials
                  }),
                  catchError(
                    (error: HttpErrorResponse) =>
                      this.setWsError(error, 'updateMaterial') // Handle error in updating material
                  )
                )
            )
          )
        )
      )
  );

  public deleteMaterial = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [void, Params]) =>
        this.materialService.deleteMaterial(params['idmaterial']).pipe(
          switchMap(() => {
            // Handle response from deleteMaterial
            this.toastr.success(
              this.translateService.instant('commun.operationTerminee')
            );
            void this.router.navigate(['/p/qualite/materiel']); // Navigate to the specified route
            return this.getMaterials(); // Perform a search for materials
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteMaterial')
          )
        )
      )
    )
  );

  public exportPdfMaterial = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [void, Params]) => {
        return this.materialService
          .exportPdfMaterial(params['idmaterial'])
          .pipe(
            tap((resp: HttpResponse<Blob>) => exportFile(resp)),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'exportPdfMaterialError')
            )
          );
      })
    )
  );

  public getMaterialAlerts = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([_, params]: [void, Params]) =>
        this.materialService.getMaterialAlerts(+params['idmaterial']).pipe(
          tap((alerts: IMaterialAlertResponse) => this.patchState({ alerts })),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'getMaterialAlerts')
          )
        )
      )
    )
  );

  public exportMaterials = this.effect(
    (searchForm$: Observable<IMaterialSearch>) =>
      searchForm$.pipe(
        switchMap((searchForm: IMaterialSearch) => {
          const query = this.sharedService.getSearchQuery(searchForm);
          return this.materialService.exportMaterials(query).pipe(
            tap((resp: HttpResponse<Blob>) => exportFile(resp)),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, `export.${searchForm.type}`)
            )
          );
        })
      )
  );

  public addEventSelection = this.effect(
    (eventSelection$: Observable<IMaterialEventSelection>) =>
      eventSelection$.pipe(
        switchMap((eventSelection: IMaterialEventSelection) =>
          this.materialService.addEventSeletion(eventSelection).pipe(
            switchMap(() => {
              this.toastr.success(
                this.translateService.instant('commun.operationTerminee')
              );
              void this.router.navigate(['/p/qualite/materiel']);
              return this.getMaterials();
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'addEvent')
            )
          )
        )
      )
  );

  public addEvent = this.effect((event$: Observable<IMaterialEvent>) =>
    event$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([event, params]: [IMaterialEvent, Params]) =>
        this.materialService.addEvent(params['idmaterial'], event).pipe(
          switchMap(() => {
            this.toastr.success(
              this.translateService.instant('commun.operationTerminee')
            );
            return this.setMaterialEvents(params);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'addEvent')
          )
        )
      )
    )
  );

  public updateEvent = this.effect(
    (event$: Observable<Partial<IMaterialEvent>>) =>
      event$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([event, params]: [Partial<IMaterialEvent>, Params]) =>
          this.materialService.updateEvent(params['idmaterial'], event).pipe(
            switchMap(() => {
              this.toastr.success(
                this.translateService.instant('commun.operationTerminee')
              );
              return this.setMaterialEvents(params);
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'updateEvent')
            )
          )
        )
      )
  );

  public deleteEvent = this.effect((idEvent$: Observable<number>) =>
    idEvent$.pipe(
      withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
      switchMap(([idEvent, params]: [number, Params]) =>
        this.materialService.deleteEvent(params['idmaterial'], idEvent).pipe(
          switchMap(() => {
            this.toastr.success(
              this.translateService.instant('commun.operationTerminee')
            );
            return this.setMaterialEvents(params);
          }),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'deleteEvent')
          )
        )
      )
    )
  );

  public downloadEventFile = this.effect((fileUrl$: Observable<string>) => {
    return fileUrl$.pipe(
      switchMap((fileUrl: string) => {
        return this.materialService.downloadEventFile(fileUrl).pipe(
          tap((resp: HttpResponse<Blob>) => exportFile(resp)),
          catchError((error: HttpErrorResponse) =>
            this.setWsError(error, 'downloadEventFile')
          )
        );
      })
    );
  });

  public deleteEventFile = this.effect(
    (
      data$: Observable<{
        eventId: number;
        fileId: number;
        action: () => void;
      }>
    ) => {
      return data$.pipe(
        withLatestFrom(this.store.pipe(select(RouterParamsSelector))),
        switchMap(([{ eventId, fileId, action }, params]) => {
          return this.materialService.deleteEventFile(eventId, fileId).pipe(
            switchMap(() => {
              action();
              this.toastr.success(
                this.translateService.instant('commun.operationTerminee')
              );
              return this.setMaterialEvents(params);
            }),
            catchError((error: HttpErrorResponse) =>
              this.setWsError(error, 'deleteEventFile')
            )
          );
        })
      );
    }
  );

  private getMaterials(): Observable<IMaterial[] | HttpErrorResponse> {
    return this.materialService.getMaterials().pipe(
      tap((materials: IMaterial[]) => this.setMaterials(materials)),
      catchError((error: HttpErrorResponse) =>
        this.setWsError(error, 'searchMaterials')
      )
    );
  }

  private setMaterialEvents(
    params: Params
  ): Observable<IMaterial | HttpErrorResponse> {
    const getMaterial$ = this.materialService
      .getMaterial(+params['idmaterial'])
      .pipe(
        tap(({ materiel_evenements }: IMaterial) =>
          this.patchState({ materialEvents: materiel_evenements })
        ),
        catchError((error: HttpErrorResponse) => {
          void this.router.navigate(['/p/qualite/materiel']);
          return this.setWsError(error, 'materialInfosFiche');
        })
      );

    const alertCheck$ = this.materialService
      .getMaterialAlerts(+params['idmaterial'])
      .pipe(
        tap((alerts: IMaterialAlertResponse) => this.patchState({ alerts })),
        catchError((error: HttpErrorResponse) =>
          this.setWsError(error, 'getMaterialAlerts')
        )
      );

    return forkJoin([getMaterial$, alertCheck$]).pipe(
      catchError((error) => of(error))
    );
  }

  private saveMaintenanceCompany(
    materialForm: Partial<IMaterialFormGroupValue>
  ): Observable<Partial<IMaterial>> {
    const maintenanceCompany = materialForm.societe_maintenance;

    if (!maintenanceCompany) {
      return of(materialForm);
    }

    return iif(
      () => !!maintenanceCompany.id,
      this.materialService.updateMaintenanceCompany(maintenanceCompany),
      this.materialService.addMaintenanceCompany(maintenanceCompany)
    ).pipe(
      map(({ id }: IMaterialMaintenanceCompany) => {
        delete materialForm.societe_maintenance;
        return {
          ...materialForm,
          materiel_societe_maintenance_id: id,
        };
      }),
      tap(() => this.getMaintenanceCompanies()),
      catchError(() => {
        const errorMessage = this.translateService.instant(
          'qualite.material.errors.' + maintenanceCompany.id
            ? 'updateMaintenanceCompany'
            : 'addMaintenanceCompany',
          {
            value: `${maintenanceCompany.nom}`,
          }
        );
        this.toastr.error(errorMessage);
        return of(null);
      })
    );
  }
}
