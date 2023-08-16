export interface IMaterialMaintenanceCompany {
  id?: number;
  nom: string;
  telephone: string;
  email: string;
}

export class MaterialMaintenanceCompany implements IMaterialMaintenanceCompany {
  constructor(
    public id: number = null,
    public nom: string = '',
    public telephone: string = '',
    public email: string = ''
  ) {}
}
