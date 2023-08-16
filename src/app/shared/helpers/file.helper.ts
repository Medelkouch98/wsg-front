import { saveAs } from 'file-saver';
import { HttpResponse } from '@angular/common/http';

/**
 * Export file
 * @param resp {resp: HttpResponse<Blob>}
 */
export const exportFile = (resp: HttpResponse<Blob>): void => {
  const filename = resp.headers
    .get('content-disposition')
    .split(';')[1]
    .split('=')[1]
    .replace(/\"/g, '');
  saveAs(resp.body, filename);
};
