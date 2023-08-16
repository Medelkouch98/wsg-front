export interface WebsocketExportResponse {
  channel: string;
  data: string | WebsocketExportDataResponse;
  event: string;
}

export interface WebsocketExportDataResponse {
  status: string;
  progression: number;
  progressMax: number;
  progressNow: number;
  output: {
    file_uuid: string;
  };
  input: {
    user_id: number;
    uuid: string;
  };
}
