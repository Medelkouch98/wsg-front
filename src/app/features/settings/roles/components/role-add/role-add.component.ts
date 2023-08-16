import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RolesStore } from '../../roles.store';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  FieldControlLabelDirective,
  FormControlErrorDirective,
  MarkRequiredFormControlAsDirtyDirective,
} from '@app/directives';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Observable, tap } from 'rxjs';
import { IModule, IRole } from '@app/models';
import { IAddRoleFormGroup } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { recursivelyEmptyModulePermissions } from '../../helpers/roles.heplers';
import { RoleValidator } from './../../validators/roles.validator';

@Component({
  selector: 'app-role-add',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    FieldControlLabelDirective,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MarkRequiredFormControlAsDirtyDirective,
    FormControlErrorDirective,
  ],
  providers: [RoleValidator],
  templateUrl: './role-add.component.html',
})
export class RoleAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesStore = inject(RolesStore);
  private roleValidator = inject(RoleValidator);

  public roleForm: FormGroup<IAddRoleFormGroup>;

  public roles$: Observable<IRole[]> = this.rolesStore.allRoles$.pipe(
    tap((roles: IRole[]) => {
      //Also sets the emptyPermissionModules property based on the modules of the first role in the array.
      this.emptyPermissionModules = recursivelyEmptyModulePermissions(
        roles[0]?.modules
      );
    })
  );

  private emptyPermissionModules: IModule[];
  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.roleForm = this.fb.group<IAddRoleFormGroup>({
      label: this.fb.control(null, {
        validators: [Validators.required, Validators.maxLength(40)],
        asyncValidators: this.roleValidator.uniqueRoleName(),
        updateOn: 'blur',
      }),
      role: this.fb.control(null),
    });
  }

  /**
   * Adds a new role using the form data from the roleForm.
   * If modules are not provided in the form data, emptyPermissionModules property is used.
   */
  public addRole(): void {
    const formValue = this.roleForm.getRawValue();
    const modules = formValue.role?.modules ?? this.emptyPermissionModules;
    const role: IRole = {
      nom: formValue.label,
      is_reference: false,
      modules,
    };
    this.rolesStore.addRole(role);
  }
}
