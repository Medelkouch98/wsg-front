import { environment } from 'environments/environment';

export const API_URL = `${environment.apiUrl}`;
export const USERS_API_URL = `${API_URL}utilisateurs`;
export const CONTROLEURS_API_URL = `${API_URL}controleurs`;
export const STATISTICS_API_URL = `${API_URL}statistiques/VL/`;
export const EXPLOITANT_CENTRE_API_URL = `${API_URL}exploitants`;
export const FACTURE_API_URL = `${API_URL}factures`;
export const ROLES_API_URL = `${API_URL}roles`;
export const ROLES_MODULES_API_URL = `${API_URL}role-modules`;
export const REGLEMENTS_API_URL = `${API_URL}reglements`;
export const EXPORTS_ETATS_API_URL = `${API_URL}gestion/exports`;
export const FACTURE_COMPTE_API_URL = `${API_URL}factures/compte/`;
export const EXPORT_SAP_TUV_API_URL = `${API_URL}exports/tuv`;
export const MATERIAL_API_URL = `${API_URL}materiels`;
export const CLOTURE_CAISSE_API_URL = `${API_URL}cloture-caisses`;
