import { IControleSelection } from './controle-selection.model';

export interface IGenerateFactureRequest {
  date_facture: string;
  clients: IControleSelection[];
}

export class GenerateFactureRequest implements IGenerateFactureRequest {
  constructor(
    public date_facture: string = '',
    public clients: IControleSelection[] = []
  ) {}
}
