import {
  AfterViewInit,
  Component,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { IMaterial, IMaterialDisplaySubType } from '../../../models';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MIN_PAGE_SIZE_OPTIONS } from '@app/config';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MaterialStore } from '../../../material.store';
import { StatusIllustrationComponent } from '@app/components';
import { MatCardModule } from '@angular/material/card';

/**
 * Component representing the Material Sub Type.
 */
@Component({
  selector: 'app-material-sub-type',
  templateUrl: './material-sub-type.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    TranslateModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    StatusIllustrationComponent,
  ],
})
export class MaterialSubTypeComponent implements AfterViewInit {
  private router = inject(Router);
  private materialStore = inject(MaterialStore);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() columns: string[];
  @Input() showSubTypeColumns: boolean;
  @Input() showActions: boolean;

  /**
   * Setter for the subType property.
   * Sets the subType value and updates the columns based on the subType's characteristics and event types.
   * @param value The subType value.
   */
  @Input() set subType(value: IMaterialDisplaySubType) {
    this._subType = value;
    this.setColumns(value);
    if (!value?.materials?.length) return;
    this.materials.data = [...value.materials];
  }
  get subType(): IMaterialDisplaySubType {
    return this._subType;
  }
  public _subType: IMaterialDisplaySubType;

  public displayedColumns: string[];
  public materials = new MatTableDataSource<IMaterial>([]);
  selection = new SelectionModel<IMaterial>(true, []);
  public MIN_PAGE_SIZE_OPTIONS = MIN_PAGE_SIZE_OPTIONS;

  /**
   * Sets the columns to be displayed based on the subType's characteristics and event types.
   * @param subType The subType value.
   */
  private setColumns(subType: IMaterialDisplaySubType): void {
    this.displayedColumns = [...this.columns];

    if (this.showSubTypeColumns) {
      const materiel_caracteristiques = subType.materiel_caracteristiques?.map(
        ({ libelle }) => libelle
      );
      const materiel_evenement_types = subType.materiel_evenement_types
        .filter(({ is_displayed }) => is_displayed)
        .map(({ libelle }) => libelle);
      this.displayedColumns.push(
        ...materiel_caracteristiques,
        ...materiel_evenement_types
      );
    }

    if (this.showActions) {
      this.displayedColumns.push('actions');
    }
  }

  /**
   * Retrieves the value of a characteristic for a given material.
   * @param mat The material object.
   * @param label The label of the characteristic.
   * @returns The value of the characteristic for the material.
   */
  public getCharacteristicValue(mat: IMaterial, label: string): string {
    return mat.materiel_caracteristiques.find(
      ({ libelle }) => libelle === label
    )?.valeur;
  }

  /**
   * Retrieves the value of an event for a given material.
   * @param mat The material object.
   * @param id The ID of the event type.
   * @returns The value of the event for the material.
   */
  public getEventValue(mat: IMaterial, id: number): string {
    return mat.materiel_evenements.find(
      ({ materiel_evenement_type_id }) => materiel_evenement_type_id === id
    )?.date;
  }

  /**
   * Navigates to the details page of a material.
   * @param material The material object.
   */
  public goToDetails(material: IMaterial): void {
    if (!this.showActions) return;
    void this.router.navigate(['/p/qualite/materiel', material.id]);
  }

  /**
   * Checks if all rows are selected.
   * @returns True if all rows are selected, false otherwise.
   */
  public get isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.materials.data.length;
    return numSelected === numRows;
  }

  /**
   * Toggles the selection of all rows.
   * @param checked Whether to select or deselect all rows.
   */
  public toggleAllRows(checked: boolean): void {
    this.selection.clear();
    if (checked) {
      this.selection.select(...this.materials.data);
      this.materialStore.selectMaterials(this.materials.data);
    } else {
      this.materialStore.unselectMaterials(this.materials.data);
    }
  }

  /**
   * Toggles the selection of a single row.
   * @param material The material object.
   * @param checked Whether to select or deselect the row.
   */
  public toggleRow(material: IMaterial, checked: boolean): void {
    this.selection.toggle(material);
    if (checked) {
      this.materialStore.selectMaterials([material]);
    } else {
      this.materialStore.unselectMaterials([material]);
    }
  }

  ngAfterViewInit(): void {
    if (this.materials) {
      this.materials.paginator = this.paginator;
      this.materials.sort = this.sort;
    }
  }
}
