import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DirectionEnum, PermissionType } from '@app/enums';
import { IActionsButton } from '@app/models';
import { ActionsButtonsComponent, AlertComponent } from '@app/components';
import { MaterialStore } from '../../material.store';
import { MaterialSearchFormComponent } from './material-search-form/material-search-form.component';
import { MaterialListComponent } from '../material-list/material-list.component';
import { Router } from '@angular/router';
import { IMaterialDisplayCategory, IMaterialSearch } from '../../models';
import { Observable, tap } from 'rxjs';
import { MaterialCategoryComponent } from '../material-list/material-category/material-category.component';
import { MaterialTypeComponent } from '../material-list/material-type/material-type.component';
import { MaterialSubTypeComponent } from '../material-list/material-sub-type/material-sub-type.component';

/**
 * Component for material search functionality.
 */
@Component({
  selector: 'app-material-search',
  templateUrl: './material-search.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    TranslateModule,
    ActionsButtonsComponent,
    MaterialSearchFormComponent,
    MaterialListComponent,
    MaterialCategoryComponent,
    MaterialTypeComponent,
    MaterialSubTypeComponent,
    AlertComponent,
  ],
})
export class MaterialSearchComponent {
  private materialStore = inject(MaterialStore);
  public router = inject(Router);

  @ViewChild(MaterialSearchFormComponent)
  private searchFormComponent: MaterialSearchFormComponent;

  public materials$: Observable<IMaterialDisplayCategory[]> =
    this.materialStore.seaechedMaterial$.pipe(
      tap(
        (materials: IMaterialDisplayCategory[]) =>
          (this.showAlert = materials.some(({ has_error }) => has_error))
      )
    );

  public showAlert = false;

  public buttons: IActionsButton[] = [
    {
      libelle: 'commun.exportPdf',
      direction: DirectionEnum.LEFT,
      action: 'exportPdf',
      icon: 'picture_as_pdf',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
    {
      libelle: 'commun.exportXls',
      direction: DirectionEnum.LEFT,
      action: 'exportXls',
      icon: 'print',
      customColor: 'green',
      permissions: [PermissionType.EXPORT],
    },
    {
      libelle: 'qualite.material.maintenanceContract',
      direction: DirectionEnum.RIGHT,
      action: 'addMaintenanceContract',
      permissions: [PermissionType.WRITE],
    },
    {
      libelle: 'qualite.material.currentMaintenanceDate',
      direction: DirectionEnum.RIGHT,
      action: 'addCurrentMaintenanceDate',
      permissions: [PermissionType.WRITE],
    },
    {
      libelle: 'qualite.material.addMaterial',
      direction: DirectionEnum.RIGHT,
      action: 'addMaterial',
      permissions: [PermissionType.WRITE],
    },
  ];

  /**
   * Handles the actions triggered by the action buttons.
   * @param action The action to be performed.
   */
  public handleActions(
    action:
      | 'exportPdf'
      | 'exportXls'
      | 'addMaterial'
      | 'addCurrentMaintenanceDate'
      | 'addMaintenanceContract'
  ): void {
    switch (action) {
      case 'exportPdf':
        this.exportMaterials('pdf');
        break;
      case 'exportXls':
        this.exportMaterials('xls');
        break;
      case 'addMaterial':
        void this.router.navigate(['/p/qualite/materiel/add']);
        break;
      case 'addCurrentMaintenanceDate':
        void this.router.navigate(['/p/qualite/materiel/date-entretien']);
        break;
      case 'addMaintenanceContract':
        void this.router.navigate(['/p/qualite/materiel/contrat-maintenance']);
        break;
    }
  }

  /**
   * Exports the materials data.
   * @param type The export type (pdf or xls).
   */
  public exportMaterials(type: 'pdf' | 'xls'): void {
    const searchFormValue = this.searchFormComponent.searchForm.getRawValue();
    const searchForm: IMaterialSearch = { ...searchFormValue, type };
    this.materialStore.exportMaterials(searchForm);
  }
}
