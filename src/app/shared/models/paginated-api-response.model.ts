import { Meta, Links } from '@app/models';
export interface PaginatedApiResponse<T> {
  data: T[];
  links: Links;
  meta: Meta;
}
export class PaginatedApiResponse<T> implements PaginatedApiResponse<T> {
  data: T[];
  links: Links;
  meta: Meta;

  constructor(data?: T[]) {
    this.data = data || null;
    this.links = new Links();
    this.meta = new Meta(data?.length);
  }
}
