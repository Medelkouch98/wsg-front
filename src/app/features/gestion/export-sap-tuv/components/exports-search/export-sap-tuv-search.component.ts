import { Component } from '@angular/core';
import { ExportSapTuvSearchFormComponent } from './exports-search-form/export-sap-tuv-search-form.component';

@Component({
  selector: 'app-export-sap-tuv-search',
  standalone: true,
  imports: [ExportSapTuvSearchFormComponent],
  template: `
    <app-export-sap-tuv-search-form />
  `,
})
export class ExportSapTuvSearchComponent {}
