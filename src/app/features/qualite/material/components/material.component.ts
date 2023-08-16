import { Component, OnInit, inject } from '@angular/core';
import { MaterialStore } from '../material.store';
import { RouterOutlet } from '@angular/router';
import { MaterialService } from '../services/material.service';

/**
 * Component for managing the material related functionality.
 */
@Component({
  selector: 'app-material',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  providers: [MaterialStore, MaterialService],
})
export class MaterialComponent implements OnInit {
  private materialStore = inject(MaterialStore);

  ngOnInit(): void {
    this.materialStore.materialsSearch();
    this.materialStore.getMarques();
    this.materialStore.getModeles();
    this.materialStore.getMaintenanceCompanies();
    this.materialStore.getMaterialEventTypes();
  }
}
