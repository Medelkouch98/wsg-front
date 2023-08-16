import { IAuditAnomalieFile } from './audit-anomalie-file.model';

export interface IAuditAnomalie {
  id: number;
  audit_id: number;
  action: string;
  anomalie: string;
  commentaire: string;
  commentaire_reseau: string;
  date_reponse_centre: string;
  date_reponse_reseau: string;
  gravite: string;
  justification: string;
  status: boolean;
  traite: boolean;
  validee_reseau: number;
  fichiers: IAuditAnomalieFile[];
}
