export interface Links {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export class Links implements Links {
  first: string;
  last: string;
  prev: string;
  next: string;

  constructor() {
    this.first = null;
    this.last = null;
    this.prev = null;
    this.next = null;
  }
}
