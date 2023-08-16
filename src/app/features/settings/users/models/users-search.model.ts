export interface IUsersSearch {
  nom: string;
  prenom: string;
  agrement: string;
  actif: string | number;
  role_id: string;
  is_export?: boolean;
}
export class UsersSearch implements IUsersSearch {
  constructor(
    public nom: string = null,
    public prenom: string = null,
    public agrement: string = null,
    public actif: string = '',
    public role_id: string = ''
  ) {}
}
