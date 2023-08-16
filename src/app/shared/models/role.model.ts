import { IModule } from './module.model';

export interface IRole {
  id?: number;
  nom: string;
  is_reference: boolean;
  slug?: string;
  modules?: IModule[];
  groupe_id?: number;
}
