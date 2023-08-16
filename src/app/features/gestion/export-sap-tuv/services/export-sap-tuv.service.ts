import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EXPORT_SAP_TUV_API_URL } from '@app/config';
import { Observable } from 'rxjs';
import { QueryParam } from '@app/models';

@Injectable()
export class ExportSapTuvService {
  private http = inject(HttpClient);

  public exportSapTuv(params: QueryParam): Observable<void> {
    return this.http.get<void>(EXPORT_SAP_TUV_API_URL, {
      params,
    });
  }
}
