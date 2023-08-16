export interface IContreVisiteStatisticsResponse {
  label: string;
  vtp: string;
  cv: string;
  vtc: string;
  cvc: string;
  total: string;
  extras?: IContreVisiteStatisticsResponse[];
}
