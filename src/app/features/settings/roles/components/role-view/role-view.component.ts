import { Component, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { RolesStore } from '../../roles.store';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { Observable, filter, map, tap, withLatestFrom } from 'rxjs';
import { IModule, IRole } from '@app/models';
import {
  IModuleFormGroup,
  IRoleFormGroup,
  IRoleFormGroupValue,
} from '../../models';
import { MatCardModule } from '@angular/material/card';
import { ModuleCardComponent } from './module-card/module-card.component';
import { MenuTypeEnum, PermissionType } from '@app/enums';
import { GlobalHelper } from '@app/helpers';
import {
  getModuleChildrenIndexes,
  getModuleParentsIndexes,
} from '../../helpers/roles.heplers';
import { AppState } from 'app/core/store/app.state';
import { Store, select } from '@ngrx/store';
import { AccessPermissionsSelector } from 'app/core/store/auth/auth.selectors';

@Component({
  selector: 'app-role-add',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    TranslateModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    ModuleCardComponent,
  ],
  templateUrl: './role-view.component.html',
})
export class RoleViewComponent implements OnInit {
  private rolesStore = inject(RolesStore);
  private fb = inject(FormBuilder);
  public store = inject(Store<AppState>);
  public isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );
  public role$: Observable<IRole> = this.rolesStore.role$.pipe(
    withLatestFrom(this.isReadOnly$),
    filter(([role, _isReadOnly]: [IRole, boolean]) => !!role),
    tap(([role, isReadOnly]: [IRole, boolean]) => {
      this.initModulesForm(role);
      isReadOnly && this.roleForm.disable();
    }),
    map(([role, _isReadOnly]: [IRole, boolean]) => role)
  );
  public roleForm: FormGroup<IRoleFormGroup>;
  public roleForm$: Observable<[IRole, boolean]>;

  ngOnInit(): void {
    this.rolesStore.getRole();
    this.roleForm = this.fb.group({
      id: [null],
      modules: this.fb.array([] as FormGroup<IModuleFormGroup>[]),
    });
  }

  /**
   * Returns the modules property from the roleForm form group .
   * @returns {FormArray<FormGroup<IModuleFormGroup>>} The modules form array.
   */
  public get modulesForm(): FormArray<FormGroup<IModuleFormGroup>> {
    return this.roleForm.controls.modules;
  }

  /**
   * Initializes the modules form with values from the provided role by setting the ID control value.
   * Clearing the modules form array, and iterating through each group module to populate the form array
   * with corresponding form groups for each module and its child modules.
   *
   * @param role - The role containing the modules data.
   */
  private initModulesForm(role: IRole): void {
    this.roleForm.controls.id.setValue(role.id);
    this.modulesForm.clear();

    role.modules?.forEach((groupModule: IModule) => {
      if (groupModule.type !== MenuTypeEnum.Sub) return;
      this.modulesForm.push(
        this.fb.group<IModuleFormGroup>({
          id: this.fb.control(groupModule.id),
          nom: this.fb.control(groupModule.nom),
          parent_id: this.fb.control(groupModule.parent_id),
          modules: this.fb.array(
            groupModule.modules?.map((module: IModule) =>
              this.fb.group<IModuleFormGroup>({
                id: this.fb.control(module.id),
                nom: this.fb.control(module.nom),
                parent_id: this.fb.control(module.parent_id),
                parentsIndexes: this.fb.control(
                  getModuleParentsIndexes(module.id, groupModule.modules)
                ),
                childrenIndexes: this.fb.control(
                  getModuleChildrenIndexes(module.id, groupModule.modules)
                ),
                permissions: this.fb.control({
                  value: module.permissions,
                  disabled: role.is_reference,
                }),
              })
            )
          ),
          permissions: this.fb.control({
            value: groupModule.permissions,
            disabled: role.is_reference,
          }),
        })
      );
    });
  }

  /**
   * Saves the updated permissions for the selected role.
   */
  public savePermissions(): void {
    this.roleForm.controls.id.markAsDirty();
    const updatedValues: IRoleFormGroupValue = GlobalHelper.getDirtyValues(
      this.roleForm
    );
    this.rolesStore.updatePermissions(updatedValues);
  }
}
