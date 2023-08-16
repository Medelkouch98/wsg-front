export interface IAuditSearchForm {
  year: number;
  type_audit_id: number;
}
export class AuditSearchForm implements IAuditSearchForm {
  year: number;
  type_audit_id: number;
  constructor() {
    this.year = null;
    this.type_audit_id = null;
  }
}
