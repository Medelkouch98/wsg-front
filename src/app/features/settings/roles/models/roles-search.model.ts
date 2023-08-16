export interface IRolesSearch {
  nom: string;
  is_reference: number;
}
export class RolesSearch implements IRolesSearch {
  constructor(public nom: string = null, public is_reference: number = -1) {}
}
