import { MatIconModule } from '@angular/material/icon';
import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { IMaterialDisplayCategory } from '../../../models';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MaterialTypeComponent } from '../material-type/material-type.component';

/**
 * Represents a component that displays a material category with expandable sections.
 */
@Component({
  selector: 'app-material-category',
  templateUrl: './material-category.component.html',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
  ],
})
export class MaterialCategoryComponent {
  @Input() category: IMaterialDisplayCategory;
  @Input() showError: boolean;
  @Input() showSelect: boolean;
  @Input() expanded: boolean;

  /**
   * QueryList of MaterialTypeComponent instances within the content of the component.
   */
  @ContentChildren(MaterialTypeComponent)
  private typeComponents: QueryList<MaterialTypeComponent>;

  /**
   * Toggles the selection of all checkboxes within the category.
   * @param checked - Indicates whether the checkboxes should be checked or unchecked.
   */
  public toggleAllCheckboxes(checked: boolean): void {
    this.typeComponents.forEach((typeComponent) =>
      typeComponent.toggleAllCheckboxes(checked)
    );
  }

  /**
   * Checks if any type component within the category has a selected item.
   * @returns True if there is a selected item, false otherwise.
   */
  public get hasSelection(): boolean {
    return this.typeComponents.some(
      (typeComponent) => typeComponent.hasSelection
    );
  }

  /**
   * Checks if all type components within the category are fully selected.
   * @returns True if all components are fully selected, false otherwise.
   */
  public get isAllSelected(): boolean {
    return (
      this.typeComponents.filter((typeComponent) => typeComponent.isAllSelected)
        .length === this.typeComponents.length
    );
  }
}
