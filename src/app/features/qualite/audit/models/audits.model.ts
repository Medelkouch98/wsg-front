import { IAuditAnomalie } from './audit-anomalie.model';

export interface IAudits {
  id: number;
  type_audit_id: number;
  numero_audit: number;
  date_audit: string;
  auditeur: string;
  motif: string;
  avis_initial: string;
  avis_final: string;
  date_avis_final: string;
  nombre_relance: number;
  date_derniere_relance: string;
  anotations: string;
  agrement_controleur: string;
  agrement_centre_rattachement: string;
  numero_pv: number;
  audit_fichier_id: number;
  relancee_reseau: boolean;
  anomalies: IAuditAnomalie[];
}
