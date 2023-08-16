import { HttpErrorResponse } from '@angular/common/http';

export interface IWsError {
  status?: number | null;
  message?: string | null;
  messageToShow?: string | null;
}

export class WsErrorClass implements IWsError {
  status: number | null;
  message: string | null;
  messageToShow: string | null;

  constructor(error: HttpErrorResponse | null = null) {
    this.status = error ? error.status : null;
    this.message = error ? error.message : null;
    this.messageToShow = null;
  }
}
