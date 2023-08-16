import {
  Component,
  ContentChildren,
  Input,
  QueryList,
  inject,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { IMaterialDisplayType } from 'app/features/qualite/material/models';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MaterialSubTypeComponent } from '../material-sub-type/material-sub-type.component';

/**
 * The Material Type Component displays a type of material along with its sub-types.
 */
@Component({
  selector: 'app-material-type',
  templateUrl: './material-type.component.html',
  standalone: true,
  imports: [NgIf, MatExpansionModule, MatCheckboxModule, MatIconModule],
})
export class MaterialTypeComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  @Input() showError: boolean;
  @Input() showSelect: boolean;

  /**
   * Gets the type of material to be displayed.
   */
  @Input() public get type(): IMaterialDisplayType {
    return this._type;
  }

  /**
   * Sets the type of material and registers the corresponding SVG icon.
   * @param type The type of material.
   */
  public set type(type: IMaterialDisplayType) {
    this._type = type;
    this.iconRegistry.addSvgIcon(
      type.icon,
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `../../../../../../../../assets/images/icon/${type.icon}.svg`
      )
    );
  }

  private _type: IMaterialDisplayType;

  /**
   * QueryList of MaterialSubTypeComponent instances within the content of the component.
   */
  @ContentChildren(MaterialSubTypeComponent)
  private subTypeComponents: QueryList<MaterialSubTypeComponent>;

  /**
   * Toggles the selection of all checkboxes within the type.
   * @param checked - Indicates whether the checkboxes should be checked or unchecked.
   */
  public toggleAllCheckboxes(checked: boolean): void {
    this.subTypeComponents.forEach((subTypeComponent) =>
      subTypeComponent.toggleAllRows(checked)
    );
  }

  /**
   * Checks if any sub-type component within the category has a selected item.
   * @returns True if there is a selected item, false otherwise.
   */
  public get hasSelection(): boolean {
    return this.subTypeComponents.some(
      (subTypeComponent) => !!subTypeComponent.selection.selected.length
    );
  }

  /**
   * Checks if all sub-types components within the type are fully selected.
   * @returns True if all components are fully selected, false otherwise.
   */
  public get isAllSelected(): boolean {
    return (
      this.subTypeComponents.filter(
        (subTypeComponent) => subTypeComponent.isAllSelected
      ).length === this.subTypeComponents.length
    );
  }
}
