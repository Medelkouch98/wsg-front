import { Component } from '@angular/core';
import { AuditStore } from '../../audit.store';
import { AuditSearchFormComponent } from './audit-search-form/audit-search-form.component';
import { AuditSearchTableComponent } from './audit-search-table/audit-search-table.component';

@Component({
  selector: 'app-audits-search',
  standalone: true,
  imports: [AuditSearchFormComponent, AuditSearchTableComponent],
  template: `
    <app-audit-search-form></app-audit-search-form>
    <app-audit-search-table></app-audit-search-table>
  `,
  providers: [AuditStore],
})
export class AuditComponent {
  constructor() {}
}
