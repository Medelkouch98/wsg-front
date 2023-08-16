import { Component, OnInit, inject } from '@angular/core';
import { MaterialStore } from '../../material.store';
import { MaterialFormComponent } from '../material-form/material-form.component';

/**
 * Component for adding a new material.
 */
@Component({
  selector: 'app-material-add',
  standalone: true,
  imports: [MaterialFormComponent],
  template: `
    <app-material-form [addMode]="true" />
  `,
})
export class MaterialAddComponent implements OnInit {
  private materialStore = inject(MaterialStore);

  ngOnInit(): void {
    this.materialStore.initMaterial();
  }
}
