export interface IMaterialAlertResponse {
  required: IMaterialAlert[];
  expired_soon: IMaterialAlert[];
  expired: IMaterialAlert[];
  required_soon: IMaterialAlert[];
  required_amount: IMaterialAlert[];
}

export interface IMaterialAlert {
  id: number;
  code: number;
  libelle: string;
  occurences_per_year: number;
}
