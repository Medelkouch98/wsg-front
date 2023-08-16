import { FormGroup } from '@angular/forms';
import { IModuleFormGroup, IRolesSearch } from '../models';
import { PermissionType } from '@app/enums';
import { IModule, IRole } from '@app/models';

/**
 * Applies rules to a module form based on the checked state and permission type.
 * @param {boolean} checked - The checked state of permission checkbox.
 * @param {FormGroup<IModuleFormGroup>} moduleForm - The module form to apply rules to.
 * @param {PermissionType} permission - The permission type to apply rules for.
 */
export const applyRules = (
  checked: boolean,
  moduleForm: FormGroup<IModuleFormGroup>,
  permission: PermissionType
) => {
  const permissions = moduleForm.getRawValue().permissions;
  if (checked) {
    // If checked, add READ permission if not already present and update the form value
    if (!permissions?.includes(PermissionType.READ)) {
      permissions.push(PermissionType.READ);
      moduleForm.patchValue({ permissions });
    }
  } else {
    // If unchecked READ permission, empty the permissions array in the form value
    if (permission === PermissionType.READ) {
      moduleForm.patchValue({ permissions: [] });
    }
  }

  // Mark id, parent_id, and permissions controls as dirty to indicate changes
  moduleForm.controls.id.markAsDirty();
  moduleForm.controls.parent_id.markAsDirty();
  moduleForm.controls.permissions.markAsDirty();
};

/**
 * Recursively finds the indexes of all parent modules of a given module in a provided array of modules (modules of groupModule).
 * @param {number} id - The ID of the module to find the parent indexes for.
 * @param {IModule[]} modulesList - The array of modules to search in.
 * @returns {number[]} - An array of indexes for all the parent modules of the given module ID.
 */
export const getModuleParentsIndexes = (
  id: number,
  modulesList: IModule[]
): number[] => {
  return modulesList.reduce((acc: number[], module: IModule, index: number) => {
    // Check if the current module has the given ID
    if (module.id === id) {
      const parentId = module.parent_id;
      // Check if the current module has a parent
      if (parentId) {
        // Recursively call this function on the parent module and add its indexes to the result array
        const parentsIndexes = getModuleParentsIndexes(parentId, modulesList);
        return [...parentsIndexes, index, ...acc];
      }
    }
    // If the current module is not the one we're looking for or it doesn't have a parent, just return the current result array
    return acc;
  }, []);
};

/**
 * Recursively finds the indexes of all child modules of a given module in a provided array of modules (modules of groupModule).
 * @param {number} id - The ID of the parent module.
 * @param {IModule[]} modulesList - The array of modules to search for child modules.
 * @returns {number[]} - An array of indexes for all child modules of the parent module.
 */
export const getModuleChildrenIndexes = (
  id: number,
  modulesList: IModule[]
): number[] => {
  return modulesList.reduce((acc: number[], module: IModule, index: number) => {
    // Check if the current module is a child of the parent module
    if (module.parent_id === id) {
      // Recursively call the `getModuleChildrenIndexes` function on the current module's child modules and add the result to the array
      const childrenIndexes = getModuleChildrenIndexes(module.id, modulesList);
      return [...acc, index, ...childrenIndexes];
    }
    // Return th array, which accumulates all indexes of child modules found during the loop
    return acc;
  }, []);
};

/**
 * Recursively empties the `permissions` array of each module in the provided `modules` array and any nested `modules`.
 * @param {IModule[]} modules - The array of modules to process.
 * @returns {IModule[]} - The updated array of modules with empty `permissions` arrays.
 */
export const recursivelyEmptyModulePermissions = (
  modules: IModule[]
): IModule[] => {
  return modules?.map((module) => {
    // Set the `permissions` array of the current module to an empty array
    module.permissions = [];
    // Recursively call the `recursivelyEmptyModulePermissions` function on the nested modules
    recursivelyEmptyModulePermissions(module.modules);
    return module; // Return the updated module
  });
};

/**
 * Checks if all child modules of the provided `groupModule` have empty `permissions` arrays.
 * @param {FormGroup<IModuleFormGroup>} groupModule - The `FormGroup` representing the parent module.
 * @returns {boolean} - `true` if all child modules have empty `permissions` arrays, `false` otherwise.
 */
export const areAllChildModulesPermissionsEmpty = (
  groupModule: FormGroup<IModuleFormGroup>
): boolean => {
  return !!groupModule
    .getRawValue()
    .modules?.every((module) => !module.permissions?.length);
};

/**
 * Filters an array of roles based on the provided search criteria.
 *
 * @param {IRole[]} roles - The array of roles to filter.
 * @param {IRolesSearch} searchForm - The search criteria to apply.
 * @returns {IRole[]} - The filtered array of roles.
 */
export const filterRoles = (
  roles: IRole[],
  searchForm: IRolesSearch
): IRole[] => {
  return roles.filter((role: IRole) => {
    const nomCheck =
      searchForm.nom === null ||
      role.nom.toLowerCase().includes(searchForm.nom.toLowerCase());
    const isReferenceCheck =
      searchForm.is_reference === -1 ||
      role.is_reference === !!searchForm.is_reference;
    return nomCheck && isReferenceCheck;
  });
};
