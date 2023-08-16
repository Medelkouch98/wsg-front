import { Component } from '@angular/core';
import { AdvancedSearchTableComponent } from './advanced-search-table/advanced-search-table.component';
import { AdvancedSearchFormComponent } from './advanced-search-form/advanced-search-form.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [AdvancedSearchTableComponent, AdvancedSearchFormComponent],
  template: `
    <app-advanced-search-form></app-advanced-search-form>
    <app-advanced-search-table></app-advanced-search-table>
  `,
})
export class AdvancedSearchComponent {}
