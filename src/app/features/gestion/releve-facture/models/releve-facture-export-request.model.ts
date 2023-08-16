export interface IReleveFactureExportRequest {
  clients: IReleveFactureExportRequestDetails[];
}

export class ReleveFactureExportRequest implements IReleveFactureExportRequest {
  constructor(public clients: IReleveFactureExportRequestDetails[]) {}
}

export interface IReleveFactureExportRequestDetails {
  client_id: number;
  sendMail: boolean;
}

export class ReleveFactureExportRequestDetails
  implements IReleveFactureExportRequestDetails
{
  constructor(public client_id: number, public sendMail: boolean) {}
}
