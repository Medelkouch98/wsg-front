import { ILiasse } from './liasse.model';
import { PaginatedApiResponse } from '@app/models';
import { Sort } from '@angular/material/sort';

export interface ICartonLiasse {
  id: number;
  type: string;
  premier_numero: number;
  dernier_numero: number;
  date_livraison: string;
  etat: string;
  date_utilisation: string;
  quantite_restante: number;
  // lorsqu'on cherche les liasses par id de carton et l'état de liasse (optionnel)
  // le back retourne des données avec pagination qu'on stock dans liasses du carton
  liasses?: PaginatedApiResponse<ILiasse>;

  liassesSort?: Sort;
}
export interface ICartonLiasseResponse {
  id: number;
  type: string;
  premier_numero: number;
  dernier_numero: number;
  date_livraison: string;
  etat: string;
  date_utilisation: string;
  quantite_restante: number;
  // lorsqu'on cherche par numero de liasse le back retourne la liasse recherche (tableau de liasses)
  liasses?: ILiasse[];
}
