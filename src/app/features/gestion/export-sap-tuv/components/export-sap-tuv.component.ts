import { Component } from '@angular/core';
import { ExportSapTuvStore } from '../export-sap-tuv.store';
import { ExportSapTuvSearchComponent } from './exports-search/export-sap-tuv-search.component';
import { ExportSapTuvService } from '../services/export-sap-tuv.service';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [ExportSapTuvSearchComponent],
  template: `
    <app-export-sap-tuv-search />
  `,
  providers: [ExportSapTuvStore, ExportSapTuvService],
})
export class ExportSapTuvComponent {}
