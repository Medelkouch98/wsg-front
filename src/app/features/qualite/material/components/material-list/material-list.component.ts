import { Component, Input } from '@angular/core';
import { IMaterialDisplayCategory } from '../../models';
import { NoDataSearchDirective } from '@app/directives';
import { NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

/**
 * Represents a component for displaying a list of materials.
 */
@Component({
  selector: 'app-material-list',
  templateUrl: './material-list.component.html',
  standalone: true,
  imports: [NgIf, MatExpansionModule, NoDataSearchDirective],
})
export class MaterialListComponent {
  @Input() materials: IMaterialDisplayCategory[];
}
