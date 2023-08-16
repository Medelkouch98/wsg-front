export interface ICreateProspectVehiculeRequest {
  date_validite_vtp: string;
  date_validite_vtc: string;
  immatriculation: string;
  marque: string;
  modele: string;
  numero_serie: string;
  relance_sur?: number;
}
