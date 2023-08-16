import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgFor } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IModuleFormGroup } from '../../../models';
import { CheckboxComponent, CheckboxGroupComponent } from '@app/components';
import { PermissionType } from '@app/enums';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import {
  applyRules,
  areAllChildModulesPermissionsEmpty,
} from '../../../helpers/roles.heplers';

@Component({
  selector: 'app-module-card',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    TranslateModule,
    ReactiveFormsModule,
    CheckboxGroupComponent,
    CheckboxComponent,
    MatExpansionModule,
    MatTableModule,
  ],
  templateUrl: './module-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleCardComponent {
  @Input() public groupModuleControl: FormGroup<IModuleFormGroup>;
  public permissions: PermissionType[] = Object.values(PermissionType);
  public columns = ['module', 'permissions'];

  /**
   * Applies permission rules to a module and its parent/child modules based on a permission check.
   *
   * @param {boolean} checked - Whether the permission was checked (true) or unchecked (false).
   * @param {FormGroup<IModuleFormGroup>} moduleForm - The form group for the module being checked.
   * @param {PermissionType} permission - The type of permission being checked.
   */
  public onPermissionCheck(
    checked: boolean,
    moduleForm: FormGroup<IModuleFormGroup>,
    permission: PermissionType
  ): void {
    applyRules(checked, moduleForm, permission);
    if (checked) {
      // If the permission is checked
      // Loop through the parent module indexes and apply rules to each parent module form
      // Check `read` permission of all parent modules
      moduleForm.controls.parentsIndexes.value.forEach((moduleIndex) => {
        const parentModuleForm =
          this.groupModuleControl.controls.modules.controls.at(moduleIndex);
        applyRules(checked, parentModuleForm, PermissionType.READ);
      });
    } else {
      // If the permission is unchecked
      // Loop through the children module indexes and apply rules to each child module form
      // Uncheck all the permissions of all child modules
      moduleForm.controls.childrenIndexes.value.forEach((moduleIndex) => {
        const childModuleForm =
          this.groupModuleControl.controls.modules.controls.at(moduleIndex);
        applyRules(checked, childModuleForm, PermissionType.READ);
      });
    }

    // Call the "applyRules" function to update the top-level module (group Module) control's permission based on child module controls
    // Empty group Module's permission if all child module permissions are empty, otherwise add `read` permission
    applyRules(
      !areAllChildModulesPermissionsEmpty(this.groupModuleControl),
      this.groupModuleControl,
      PermissionType.READ
    );
  }
}
