export interface IExportSapTuvRequest {
  date_debut: string;
  date_fin: string;
}
export class ExportSapTuvRequest implements IExportSapTuvRequest {
  constructor(
    public date_debut: string = null,
    public date_fin: string = null
  ) {}
}
