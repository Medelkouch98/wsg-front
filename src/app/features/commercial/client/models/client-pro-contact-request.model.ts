import { IClientProContact } from './client-pro-contact.model';

export interface IClientProContactRequest {
  contact?: IClientProContact | { [key: string]: any };
  index: number;
  clientProContactId?: number;
}
